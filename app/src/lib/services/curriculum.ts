import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation, AppError } from '$lib/db/errors';
import type { Curriculum } from '$lib/models';
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
import { validateCurriculum } from './validation';

export type CurriculumCreateInput = CreateInput<Curriculum>;
export type CurriculumUpdateInput = UpdateInput<Curriculum>;

export const curriculumService = {
	/**
	 * Create a new curriculum
	 */
	async create(input: CurriculumCreateInput): Promise<ServiceResult<Curriculum>> {
		return serviceOperation(async () => {
			// Validate input
			const validation = validateCurriculum(input);
			if (!validation.valid) {
				const firstError = Object.entries(validation.errors)[0];
				return err('VALIDATION_ERROR', firstError[1], firstError[0]);
			}

			const timestamps = createTimestamp();
			const curriculum: Curriculum = {
				id: generateUUIDv7(),
				name: input.name!,
				description: input.description,
				spaceId: input.spaceId!,
				metadata: input.metadata,
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.curricula.add(curriculum);
			}, 'curriculum.create');

			return ok(curriculum);
		}, 'curriculum.create');
	},

	/**
	 * Get a curriculum by ID
	 */
	async get(id: string): Promise<ServiceResult<Curriculum>> {
		return serviceOperation(async () => {
			const curriculum = await db.curricula.get(id);

			if (!curriculum || curriculum.deletedAt) {
				return err('NOT_FOUND', 'Curriculum not found');
			}

			return ok(curriculum);
		}, 'curriculum.get');
	},

	/**
	 * Update a curriculum
	 */
	async update(id: string, input: CurriculumUpdateInput): Promise<ServiceResult<Curriculum>> {
		return serviceOperation(async () => {
			const existing = await db.curricula.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Curriculum not found');
			}

			// Validate input if name or spaceId changed
			if (input.name !== undefined || input.spaceId !== undefined) {
				const toValidate = {
					name: input.name ?? existing.name,
					description: input.description ?? existing.description,
					spaceId: input.spaceId ?? existing.spaceId
				};
				const validation = validateCurriculum(toValidate);
				if (!validation.valid) {
					const firstError = Object.entries(validation.errors)[0];
					return err('VALIDATION_ERROR', firstError[1], firstError[0]);
				}
			}

			const updated: Curriculum = {
				...existing,
				...input,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.curricula.put(updated);
			}, 'curriculum.update');

			return ok(updated);
		}, 'curriculum.update');
	},

	/**
	 * Soft delete a curriculum
	 * Note: This does NOT cascade to objectives/lessons - handle that separately if needed
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.curricula.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Curriculum not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.curricula.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'curriculum.delete');

			return ok(undefined);
		}, 'curriculum.delete');
	},

	/**
	 * Delete a curriculum with cascading to objectives
	 */
	async deleteWithCascade(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.curricula.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Curriculum not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				return db.transaction('rw', [db.curricula, db.objectives, db.lessons], async () => {
					// Soft delete the curriculum
					await db.curricula.update(id, {
						...deleteFields,
						version: existing.version + 1
					});

					// Soft delete all objectives in this curriculum
					const objectives = await db.objectives
						.where('curriculumId')
						.equals(id)
						.and((o) => !o.deletedAt)
						.toArray();

					for (const obj of objectives) {
						await db.objectives.update(obj.id, {
							...deleteFields,
							version: obj.version + 1
						});
					}

					// Unlink lessons from this curriculum (set curriculumId to undefined)
					const lessons = await db.lessons
						.where('curriculumId')
						.equals(id)
						.and((l) => !l.deletedAt)
						.toArray();

					for (const lesson of lessons) {
						await db.lessons.update(lesson.id, {
							curriculumId: undefined,
							...updateTimestamp(),
							version: lesson.version + 1
						});
					}
				});
			}, 'curriculum.deleteWithCascade');

			return ok(undefined);
		}, 'curriculum.deleteWithCascade');
	},

	/**
	 * List curricula by space
	 */
	async listBySpace(spaceId: string): Promise<Curriculum[]> {
		return db.curricula
			.where('spaceId')
			.equals(spaceId)
			.and((c) => !c.deletedAt)
			.reverse()
			.sortBy('createdAt');
	},

	/**
	 * List all curricula (non-deleted)
	 */
	async listAll(): Promise<Curriculum[]> {
		return db.curricula
			.filter((c) => !c.deletedAt)
			.reverse()
			.sortBy('createdAt');
	}
};
