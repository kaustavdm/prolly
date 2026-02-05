import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Project, Milestone } from '$lib/models';
import {
	ok,
	err,
	createTimestamp,
	updateTimestamp,
	softDeleteFields,
	serviceOperation,
	type ServiceResult,
	type CreateInput,
	type UpdateInput
} from './base';
import { validateProject } from './validation';

export type ProjectCreateInput = CreateInput<Project>;
export type ProjectUpdateInput = UpdateInput<Project>;

export const projectService = {
	/**
	 * Create a new project
	 */
	async create(input: ProjectCreateInput): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const validation = validateProject(input);
			if (!validation.valid) {
				const firstError = Object.entries(validation.errors)[0];
				return err('VALIDATION_ERROR', firstError[1], firstError[0]);
			}

			// Validate objectiveIds exist if provided
			const objectiveIds = input.objectiveIds || [];
			if (objectiveIds.length > 0) {
				const existingObjectives = await db.objectives.bulkGet(objectiveIds);
				const validObjectives = existingObjectives.filter((o) => o && !o.deletedAt);
				if (validObjectives.length !== objectiveIds.length) {
					return err('VALIDATION_ERROR', 'One or more objectives do not exist', 'objectiveIds');
				}
			}

			const timestamps = createTimestamp();
			const project: Project = {
				id: generateUUIDv7(),
				name: input.name!,
				description: input.description,
				spaceId: input.spaceId!,
				objectiveIds,
				milestones: input.milestones || [],
				status: input.status || 'planning',
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.projects.add(project);
			}, 'project.create');

			return ok(project);
		}, 'project.create');
	},

	/**
	 * Get a project by ID
	 */
	async get(id: string): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const project = await db.projects.get(id);

			if (!project || project.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			return ok(project);
		}, 'project.get');
	},

	/**
	 * Update a project
	 */
	async update(id: string, input: ProjectUpdateInput): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const existing = await db.projects.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			// Validate if name changed
			if (input.name !== undefined || input.spaceId !== undefined) {
				const toValidate = {
					name: input.name ?? existing.name,
					spaceId: input.spaceId ?? existing.spaceId
				};
				const validation = validateProject(toValidate);
				if (!validation.valid) {
					const firstError = Object.entries(validation.errors)[0];
					return err('VALIDATION_ERROR', firstError[1], firstError[0]);
				}
			}

			// Validate objectiveIds if changed
			const objectiveIds = input.objectiveIds ?? existing.objectiveIds;
			if (input.objectiveIds !== undefined && objectiveIds.length > 0) {
				const existingObjectives = await db.objectives.bulkGet(objectiveIds);
				const validObjectives = existingObjectives.filter((o) => o && !o.deletedAt);
				if (validObjectives.length !== objectiveIds.length) {
					return err('VALIDATION_ERROR', 'One or more objectives do not exist', 'objectiveIds');
				}
			}

			const updated: Project = {
				...existing,
				...input,
				objectiveIds,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.projects.put(updated);
			}, 'project.update');

			return ok(updated);
		}, 'project.update');
	},

	/**
	 * Update project status
	 */
	async updateStatus(
		id: string,
		status: Project['status']
	): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const existing = await db.projects.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			const updated: Project = {
				...existing,
				status,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.projects.put(updated);
			}, 'project.updateStatus');

			return ok(updated);
		}, 'project.updateStatus');
	},

	/**
	 * Add a milestone to a project
	 */
	async addMilestone(id: string, milestone: Omit<Milestone, 'id'>): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const existing = await db.projects.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			const newMilestone: Milestone = {
				id: generateUUIDv7(),
				...milestone
			};

			const updated: Project = {
				...existing,
				milestones: [...existing.milestones, newMilestone],
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.projects.put(updated);
			}, 'project.addMilestone');

			return ok(updated);
		}, 'project.addMilestone');
	},

	/**
	 * Update a milestone
	 */
	async updateMilestone(
		projectId: string,
		milestoneId: string,
		updates: Partial<Omit<Milestone, 'id'>>
	): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const existing = await db.projects.get(projectId);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			const milestoneIndex = existing.milestones.findIndex((m) => m.id === milestoneId);
			if (milestoneIndex === -1) {
				return err('NOT_FOUND', 'Milestone not found');
			}

			const updatedMilestones = [...existing.milestones];
			updatedMilestones[milestoneIndex] = {
				...updatedMilestones[milestoneIndex],
				...updates
			};

			const updated: Project = {
				...existing,
				milestones: updatedMilestones,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.projects.put(updated);
			}, 'project.updateMilestone');

			return ok(updated);
		}, 'project.updateMilestone');
	},

	/**
	 * Remove a milestone
	 */
	async removeMilestone(projectId: string, milestoneId: string): Promise<ServiceResult<Project>> {
		return serviceOperation(async () => {
			const existing = await db.projects.get(projectId);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			const updated: Project = {
				...existing,
				milestones: existing.milestones.filter((m) => m.id !== milestoneId),
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.projects.put(updated);
			}, 'project.removeMilestone');

			return ok(updated);
		}, 'project.removeMilestone');
	},

	/**
	 * Mark a milestone as complete
	 */
	async completeMilestone(projectId: string, milestoneId: string): Promise<ServiceResult<Project>> {
		const completedAt = new Date().toISOString();
		return this.updateMilestone(projectId, milestoneId, { completedAt });
	},

	/**
	 * Soft delete a project
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.projects.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Project not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.projects.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'project.delete');

			return ok(undefined);
		}, 'project.delete');
	},

	/**
	 * List projects by space
	 */
	async listBySpace(spaceId: string): Promise<Project[]> {
		return db.projects
			.where('spaceId')
			.equals(spaceId)
			.and((p) => !p.deletedAt)
			.toArray();
	},

	/**
	 * List projects by status
	 */
	async listByStatus(status: Project['status']): Promise<Project[]> {
		return db.projects
			.where('status')
			.equals(status)
			.and((p) => !p.deletedAt)
			.toArray();
	},

	/**
	 * List all projects (non-deleted)
	 */
	async listAll(): Promise<Project[]> {
		return db.projects.filter((p) => !p.deletedAt).toArray();
	}
};
