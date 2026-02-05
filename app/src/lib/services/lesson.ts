import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Lesson } from '$lib/models';
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
import { validateLesson } from './validation';

export type LessonCreateInput = CreateInput<Lesson>;
export type LessonUpdateInput = UpdateInput<Lesson>;

export const lessonService = {
	/**
	 * Create a new lesson
	 */
	async create(input: LessonCreateInput): Promise<ServiceResult<Lesson>> {
		return serviceOperation(async () => {
			const validation = validateLesson(input);
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
			const lesson: Lesson = {
				id: generateUUIDv7(),
				name: input.name!,
				description: input.description,
				content: input.content,
				spaceId: input.spaceId!,
				curriculumId: input.curriculumId,
				objectiveIds,
				resourceIds: input.resourceIds || [],
				order: input.order,
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.lessons.add(lesson);
			}, 'lesson.create');

			return ok(lesson);
		}, 'lesson.create');
	},

	/**
	 * Get a lesson by ID
	 */
	async get(id: string): Promise<ServiceResult<Lesson>> {
		return serviceOperation(async () => {
			const lesson = await db.lessons.get(id);

			if (!lesson || lesson.deletedAt) {
				return err('NOT_FOUND', 'Lesson not found');
			}

			return ok(lesson);
		}, 'lesson.get');
	},

	/**
	 * Update a lesson
	 */
	async update(id: string, input: LessonUpdateInput): Promise<ServiceResult<Lesson>> {
		return serviceOperation(async () => {
			const existing = await db.lessons.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Lesson not found');
			}

			// Validate if name changed
			if (input.name !== undefined || input.spaceId !== undefined) {
				const toValidate = {
					name: input.name ?? existing.name,
					spaceId: input.spaceId ?? existing.spaceId
				};
				const validation = validateLesson(toValidate);
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

			const updated: Lesson = {
				...existing,
				...input,
				objectiveIds,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.lessons.put(updated);
			}, 'lesson.update');

			return ok(updated);
		}, 'lesson.update');
	},

	/**
	 * Soft delete a lesson
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.lessons.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Lesson not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.lessons.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'lesson.delete');

			return ok(undefined);
		}, 'lesson.delete');
	},

	/**
	 * List lessons by space
	 */
	async listBySpace(spaceId: string): Promise<Lesson[]> {
		return db.lessons
			.where('spaceId')
			.equals(spaceId)
			.and((l) => !l.deletedAt)
			.toArray();
	},

	/**
	 * List lessons by curriculum
	 */
	async listByCurriculum(curriculumId: string): Promise<Lesson[]> {
		return db.lessons
			.where('curriculumId')
			.equals(curriculumId)
			.and((l) => !l.deletedAt)
			.toArray();
	},

	/**
	 * List lessons that address a specific objective
	 */
	async listByObjective(objectiveId: string): Promise<Lesson[]> {
		return db.lessons
			.where('objectiveIds')
			.equals(objectiveId)
			.and((l) => !l.deletedAt)
			.toArray();
	},

	/**
	 * List all lessons (non-deleted)
	 */
	async listAll(): Promise<Lesson[]> {
		return db.lessons.filter((l) => !l.deletedAt).toArray();
	}
};
