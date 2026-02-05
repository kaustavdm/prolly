import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Objective } from '$lib/models';
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
import { validateObjective } from './validation';
import { validatePrerequisites } from './validation/dag';

export type ObjectiveCreateInput = CreateInput<Objective>;
export type ObjectiveUpdateInput = UpdateInput<Objective>;

export const objectiveService = {
	/**
	 * Create a new objective
	 */
	async create(input: ObjectiveCreateInput): Promise<ServiceResult<Objective>> {
		return serviceOperation(async () => {
			const validation = validateObjective(input);
			if (!validation.valid) {
				const firstError = Object.entries(validation.errors)[0];
				return err('VALIDATION_ERROR', firstError[1], firstError[0]);
			}

			// Validate prerequisites if any
			// Spread to create plain array copy (Svelte 5 reactive state uses Proxies that can't be cloned)
			const prerequisites = [...(input.prerequisites || [])];
			if (prerequisites.length > 0) {
				const dagValidation = await validatePrerequisites(
					'', // New objective, no ID yet
					prerequisites,
					input.curriculumId!
				);
				if (!dagValidation.valid) {
					return err('DAG_CYCLE', dagValidation.message || 'Invalid prerequisites', 'prerequisites');
				}
			}

			const timestamps = createTimestamp();
			const objective: Objective = {
				id: generateUUIDv7(),
				name: input.name!,
				description: input.description,
				curriculumId: input.curriculumId!,
				prerequisites,
				metadata: input.metadata ? { ...input.metadata } : undefined,
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.objectives.add(objective);
			}, 'objective.create');

			return ok(objective);
		}, 'objective.create');
	},

	/**
	 * Get an objective by ID
	 */
	async get(id: string): Promise<ServiceResult<Objective>> {
		return serviceOperation(async () => {
			const objective = await db.objectives.get(id);

			if (!objective || objective.deletedAt) {
				return err('NOT_FOUND', 'Objective not found');
			}

			return ok(objective);
		}, 'objective.get');
	},

	/**
	 * Update an objective
	 */
	async update(id: string, input: ObjectiveUpdateInput): Promise<ServiceResult<Objective>> {
		return serviceOperation(async () => {
			const existing = await db.objectives.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Objective not found');
			}

			// Validate if name or curriculumId changed
			if (input.name !== undefined || input.curriculumId !== undefined) {
				const toValidate = {
					name: input.name ?? existing.name,
					curriculumId: input.curriculumId ?? existing.curriculumId
				};
				const validation = validateObjective(toValidate);
				if (!validation.valid) {
					const firstError = Object.entries(validation.errors)[0];
					return err('VALIDATION_ERROR', firstError[1], firstError[0]);
				}
			}

			// Create plain object copy to avoid Proxy issues with IndexedDB
			const updated: Objective = {
				...existing,
				name: input.name ?? existing.name,
				description: input.description ?? existing.description,
				curriculumId: input.curriculumId ?? existing.curriculumId,
				prerequisites: input.prerequisites ? [...input.prerequisites] : existing.prerequisites,
				metadata: input.metadata ? { ...input.metadata } : existing.metadata,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.objectives.put(updated);
			}, 'objective.update');

			return ok(updated);
		}, 'objective.update');
	},

	/**
	 * Update prerequisites with DAG validation
	 */
	async updatePrerequisites(id: string, prerequisites: string[]): Promise<ServiceResult<Objective>> {
		return serviceOperation(async () => {
			const existing = await db.objectives.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Objective not found');
			}

			// Spread to create plain array copy (Svelte 5 reactive state uses Proxies that can't be cloned)
			const prereqsCopy = [...prerequisites];

			// Validate DAG
			const dagValidation = await validatePrerequisites(id, prereqsCopy, existing.curriculumId);
			if (!dagValidation.valid) {
				return err('DAG_CYCLE', dagValidation.message || 'Invalid prerequisites', 'prerequisites');
			}

			const updated: Objective = {
				...existing,
				prerequisites: prereqsCopy,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.objectives.put(updated);
			}, 'objective.updatePrerequisites');

			return ok(updated);
		}, 'objective.updatePrerequisites');
	},

	/**
	 * Soft delete an objective and remove from other objectives' prerequisites
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.objectives.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Objective not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				return db.transaction('rw', [db.objectives], async () => {
					// Soft delete the objective
					await db.objectives.update(id, {
						...deleteFields,
						version: existing.version + 1
					});

					// Remove from other objectives' prerequisites
					const dependentObjectives = await db.objectives
						.where('curriculumId')
						.equals(existing.curriculumId)
						.and((o) => !o.deletedAt && o.prerequisites.includes(id))
						.toArray();

					for (const dependent of dependentObjectives) {
						await db.objectives.update(dependent.id, {
							prerequisites: dependent.prerequisites.filter((p) => p !== id),
							...updateTimestamp(),
							version: dependent.version + 1
						});
					}
				});
			}, 'objective.delete');

			return ok(undefined);
		}, 'objective.delete');
	},

	/**
	 * List objectives by curriculum
	 */
	async listByCurriculum(curriculumId: string): Promise<Objective[]> {
		return db.objectives
			.where('curriculumId')
			.equals(curriculumId)
			.and((o) => !o.deletedAt)
			.toArray();
	},

	/**
	 * List all objectives (non-deleted)
	 */
	async listAll(): Promise<Objective[]> {
		return db.objectives.filter((o) => !o.deletedAt).toArray();
	}
};
