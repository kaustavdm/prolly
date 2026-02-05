import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Progress } from '$lib/models';
import {
	ok,
	err,
	updateTimestamp,
	serviceOperation,
	type ServiceResult
} from './base';
import { activityHelpers } from './activity';

export interface ProgressUpdateInput {
	status?: Progress['status'];
	notes?: string;
}

export const progressService = {
	/**
	 * Get or create progress entry for a user-objective pair
	 */
	async getOrCreate(userId: string, objectiveId: string): Promise<ServiceResult<Progress>> {
		return serviceOperation(async () => {
			// Check if progress entry exists
			const existing = await db.progress
				.where('[userId+objectiveId]')
				.equals([userId, objectiveId])
				.first();

			if (existing && !existing.deletedAt) {
				return ok(existing);
			}

			// Get objective to validate it exists
			const objective = await db.objectives.get(objectiveId);
			if (!objective || objective.deletedAt) {
				return err('NOT_FOUND', 'Objective not found');
			}

			// Create new progress entry
			const now = new Date().toISOString();
			const progress: Progress = {
				id: generateUUIDv7(),
				userId,
				objectiveId,
				status: 'not_started',
				updatedAt: now,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.progress.add(progress);
			}, 'progress.getOrCreate');

			return ok(progress);
		}, 'progress.getOrCreate');
	},

	/**
	 * Get progress by ID
	 */
	async get(id: string): Promise<ServiceResult<Progress>> {
		return serviceOperation(async () => {
			const progress = await db.progress.get(id);
			if (!progress || progress.deletedAt) {
				return err('NOT_FOUND', 'Progress entry not found');
			}
			return ok(progress);
		}, 'progress.get');
	},

	/**
	 * Get progress for a user-objective pair
	 */
	async getByUserObjective(userId: string, objectiveId: string): Promise<ServiceResult<Progress | null>> {
		return serviceOperation(async () => {
			const progress = await db.progress
				.where('[userId+objectiveId]')
				.equals([userId, objectiveId])
				.first();

			if (!progress || progress.deletedAt) {
				return ok(null);
			}
			return ok(progress);
		}, 'progress.getByUserObjective');
	},

	/**
	 * Start working on an objective (sets status to in_progress)
	 */
	async start(
		userId: string,
		objectiveId: string,
		spaceId: string
	): Promise<ServiceResult<Progress>> {
		return serviceOperation(async () => {
			const result = await this.getOrCreate(userId, objectiveId);
			if (!result.success) return result;

			const progress = result.data!;

			// If already in progress or achieved, no change needed
			if (progress.status !== 'not_started') {
				return ok(progress);
			}

			// Get objective name for activity
			const objective = await db.objectives.get(objectiveId);

			const updated: Progress = {
				...progress,
				status: 'in_progress',
				...updateTimestamp(),
				version: progress.version + 1
			};

			await safeDbOperation(async () => {
				await db.progress.put(updated);
			}, 'progress.start');

			// Log activity
			if (objective) {
				await activityHelpers.objectiveStarted(userId, spaceId, objectiveId, objective.name);
			}

			return ok(updated);
		}, 'progress.start');
	},

	/**
	 * Mark an objective as achieved
	 */
	async achieve(
		userId: string,
		objectiveId: string,
		spaceId: string,
		notes?: string
	): Promise<ServiceResult<Progress>> {
		return serviceOperation(async () => {
			const result = await this.getOrCreate(userId, objectiveId);
			if (!result.success) return result;

			const progress = result.data!;

			// If already achieved, no change needed
			if (progress.status === 'achieved') {
				return ok(progress);
			}

			// Get objective name for activity
			const objective = await db.objectives.get(objectiveId);

			const now = new Date().toISOString();
			const updated: Progress = {
				...progress,
				status: 'achieved',
				achievedAt: now,
				notes: notes ?? progress.notes,
				updatedAt: now,
				version: progress.version + 1
			};

			await safeDbOperation(async () => {
				await db.progress.put(updated);
			}, 'progress.achieve');

			// Log activity
			if (objective) {
				await activityHelpers.objectiveAchieved(userId, spaceId, objectiveId, objective.name);
			}

			return ok(updated);
		}, 'progress.achieve');
	},

	/**
	 * Update progress notes
	 */
	async updateNotes(id: string, notes: string): Promise<ServiceResult<Progress>> {
		return serviceOperation(async () => {
			const existing = await db.progress.get(id);
			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Progress entry not found');
			}

			const updated: Progress = {
				...existing,
				notes,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.progress.put(updated);
			}, 'progress.updateNotes');

			return ok(updated);
		}, 'progress.updateNotes');
	},

	/**
	 * Reset progress (back to not_started)
	 */
	async reset(id: string): Promise<ServiceResult<Progress>> {
		return serviceOperation(async () => {
			const existing = await db.progress.get(id);
			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Progress entry not found');
			}

			const updated: Progress = {
				...existing,
				status: 'not_started',
				achievedAt: undefined,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.progress.put(updated);
			}, 'progress.reset');

			return ok(updated);
		}, 'progress.reset');
	},

	/**
	 * List all progress for a user
	 */
	async listByUser(userId: string): Promise<Progress[]> {
		return db.progress
			.where('userId')
			.equals(userId)
			.and((p) => !p.deletedAt)
			.toArray();
	},

	/**
	 * List progress by status for a user
	 */
	async listByStatus(userId: string, status: Progress['status']): Promise<Progress[]> {
		return db.progress
			.where('userId')
			.equals(userId)
			.and((p) => !p.deletedAt && p.status === status)
			.toArray();
	},

	/**
	 * Get progress stats for a user
	 */
	async getStats(userId: string): Promise<{
		total: number;
		notStarted: number;
		inProgress: number;
		achieved: number;
	}> {
		const entries = await this.listByUser(userId);
		return {
			total: entries.length,
			notStarted: entries.filter((p) => p.status === 'not_started').length,
			inProgress: entries.filter((p) => p.status === 'in_progress').length,
			achieved: entries.filter((p) => p.status === 'achieved').length
		};
	},

	/**
	 * Check if all prerequisites for an objective are achieved
	 */
	async canStartObjective(userId: string, objectiveId: string): Promise<boolean> {
		const objective = await db.objectives.get(objectiveId);
		if (!objective || objective.deletedAt) {
			return false;
		}

		if (objective.prerequisites.length === 0) {
			return true;
		}

		// Check all prerequisites
		for (const prereqId of objective.prerequisites) {
			const progress = await db.progress
				.where('[userId+objectiveId]')
				.equals([userId, prereqId])
				.first();

			if (!progress || progress.status !== 'achieved') {
				return false;
			}
		}

		return true;
	}
};
