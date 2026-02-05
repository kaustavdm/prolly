import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Activity, ActivityType, ActivityRefs } from '$lib/models';
import { ok, err, serviceOperation, type ServiceResult } from './base';

export interface ActivityCreateInput {
	userId: string;
	spaceId: string;
	type: ActivityType;
	payload?: Record<string, unknown>;
	refs?: ActivityRefs;
}

export const activityService = {
	/**
	 * Log an activity (append-only, no updates)
	 */
	async log(input: ActivityCreateInput): Promise<ServiceResult<Activity>> {
		return serviceOperation(async () => {
			if (!input.userId) {
				return err('VALIDATION_ERROR', 'userId is required', 'userId');
			}
			if (!input.spaceId) {
				return err('VALIDATION_ERROR', 'spaceId is required', 'spaceId');
			}
			if (!input.type) {
				return err('VALIDATION_ERROR', 'type is required', 'type');
			}

			const activity: Activity = {
				id: generateUUIDv7(),
				userId: input.userId,
				spaceId: input.spaceId,
				type: input.type,
				payload: input.payload || {},
				refs: input.refs || {},
				createdAt: new Date().toISOString()
			};

			await safeDbOperation(async () => {
				await db.activities.add(activity);
			}, 'activity.log');

			return ok(activity);
		}, 'activity.log');
	},

	/**
	 * Create a correction/edit by linking to parent activity
	 */
	async correct(
		parentId: string,
		input: Omit<ActivityCreateInput, 'userId' | 'spaceId'>
	): Promise<ServiceResult<Activity>> {
		return serviceOperation(async () => {
			const parent = await db.activities.get(parentId);
			if (!parent) {
				return err('NOT_FOUND', 'Parent activity not found');
			}

			const activity: Activity = {
				id: generateUUIDv7(),
				userId: parent.userId,
				spaceId: parent.spaceId,
				type: input.type,
				payload: input.payload || {},
				refs: input.refs || parent.refs,
				parentId,
				createdAt: new Date().toISOString()
			};

			await safeDbOperation(async () => {
				await db.activities.add(activity);
			}, 'activity.correct');

			return ok(activity);
		}, 'activity.correct');
	},

	/**
	 * Get activity by ID
	 */
	async get(id: string): Promise<ServiceResult<Activity>> {
		return serviceOperation(async () => {
			const activity = await db.activities.get(id);
			if (!activity) {
				return err('NOT_FOUND', 'Activity not found');
			}
			return ok(activity);
		}, 'activity.get');
	},

	/**
	 * List activities by space (most recent first)
	 */
	async listBySpace(spaceId: string, limit = 50): Promise<Activity[]> {
		return db.activities
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.reverse()
			.limit(limit)
			.toArray();
	},

	/**
	 * List activities by user (most recent first)
	 */
	async listByUser(userId: string, limit = 50): Promise<Activity[]> {
		return db.activities
			.where('[userId+createdAt]')
			.between([userId, ''], [userId, '\uffff'])
			.reverse()
			.limit(limit)
			.toArray();
	},

	/**
	 * List activities for a specific entity (via refs)
	 */
	async listByRef(
		spaceId: string,
		refType: keyof ActivityRefs,
		refId: string,
		limit = 50
	): Promise<Activity[]> {
		const activities = await db.activities
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.reverse()
			.toArray();

		return activities.filter((a) => a.refs[refType] === refId).slice(0, limit);
	},

	/**
	 * Get latest version of an activity (follow parentId chain)
	 */
	async getLatestVersion(activityId: string): Promise<ServiceResult<Activity>> {
		return serviceOperation(async () => {
			// Find any activity that has this as parentId
			const child = await db.activities.where('parentId').equals(activityId).first();

			if (child) {
				// Recursively find the latest
				return this.getLatestVersion(child.id);
			}

			// No child means this is the latest
			const activity = await db.activities.get(activityId);
			if (!activity) {
				return err('NOT_FOUND', 'Activity not found');
			}
			return ok(activity);
		}, 'activity.getLatestVersion');
	}
};

// Helper functions to log common activities
export const activityHelpers = {
	async objectiveStarted(userId: string, spaceId: string, objectiveId: string, name: string) {
		return activityService.log({
			userId,
			spaceId,
			type: 'objective.started',
			payload: { name },
			refs: { objectiveId }
		});
	},

	async objectiveAchieved(userId: string, spaceId: string, objectiveId: string, name: string) {
		return activityService.log({
			userId,
			spaceId,
			type: 'objective.achieved',
			payload: { name },
			refs: { objectiveId }
		});
	},

	async lessonStarted(userId: string, spaceId: string, lessonId: string, name: string) {
		return activityService.log({
			userId,
			spaceId,
			type: 'lesson.started',
			payload: { name },
			refs: { lessonId }
		});
	},

	async lessonCompleted(userId: string, spaceId: string, lessonId: string, name: string) {
		return activityService.log({
			userId,
			spaceId,
			type: 'lesson.completed',
			payload: { name },
			refs: { lessonId }
		});
	},

	async projectStarted(userId: string, spaceId: string, projectId: string, name: string) {
		return activityService.log({
			userId,
			spaceId,
			type: 'project.started',
			payload: { name },
			refs: { projectId }
		});
	},

	async projectMilestoneCompleted(
		userId: string,
		spaceId: string,
		projectId: string,
		milestoneName: string
	) {
		return activityService.log({
			userId,
			spaceId,
			type: 'project.milestone_completed',
			payload: { milestoneName },
			refs: { projectId }
		});
	},

	async projectCompleted(userId: string, spaceId: string, projectId: string, name: string) {
		return activityService.log({
			userId,
			spaceId,
			type: 'project.completed',
			payload: { name },
			refs: { projectId }
		});
	},

	async custom(
		userId: string,
		spaceId: string,
		payload: Record<string, unknown>,
		refs?: ActivityRefs
	) {
		return activityService.log({
			userId,
			spaceId,
			type: 'custom',
			payload,
			refs
		});
	}
};
