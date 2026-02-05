import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Reflection, ReflectionResponse, ReflectionTemplate } from '$lib/models';
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

export type ReflectionCreateInput = CreateInput<Reflection> & {
	responses: ReflectionResponse[];
	templateId?: string;
	period?: {
		start: string;
		end: string;
	};
};

export type ReflectionUpdateInput = UpdateInput<Reflection>;

export const reflectionService = {
	/**
	 * Create a new reflection
	 */
	async create(input: ReflectionCreateInput): Promise<ServiceResult<Reflection>> {
		return serviceOperation(async () => {
			if (!input.authorId) {
				return err('VALIDATION_ERROR', 'Author is required', 'authorId');
			}
			if (!input.spaceId) {
				return err('VALIDATION_ERROR', 'Space is required', 'spaceId');
			}
			if (!input.responses || input.responses.length === 0) {
				return err('VALIDATION_ERROR', 'At least one response is required', 'responses');
			}

			const timestamps = createTimestamp();
			const reflection: Reflection = {
				id: generateUUIDv7(),
				authorId: input.authorId,
				spaceId: input.spaceId,
				templateId: input.templateId,
				responses: input.responses,
				period: input.period,
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.reflections.add(reflection);
			}, 'reflection.create');

			return ok(reflection);
		}, 'reflection.create');
	},

	/**
	 * Get a reflection by ID
	 */
	async get(id: string): Promise<ServiceResult<Reflection>> {
		return serviceOperation(async () => {
			const reflection = await db.reflections.get(id);

			if (!reflection || reflection.deletedAt) {
				return err('NOT_FOUND', 'Reflection not found');
			}

			return ok(reflection);
		}, 'reflection.get');
	},

	/**
	 * Update a reflection
	 */
	async update(id: string, input: ReflectionUpdateInput): Promise<ServiceResult<Reflection>> {
		return serviceOperation(async () => {
			const existing = await db.reflections.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Reflection not found');
			}

			const updated: Reflection = {
				...existing,
				...input,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.reflections.put(updated);
			}, 'reflection.update');

			return ok(updated);
		}, 'reflection.update');
	},

	/**
	 * Soft delete a reflection
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.reflections.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Reflection not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.reflections.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'reflection.delete');

			return ok(undefined);
		}, 'reflection.delete');
	},

	/**
	 * List reflections by space
	 */
	async listBySpace(spaceId: string): Promise<Reflection[]> {
		return db.reflections
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((r) => !r.deletedAt)
			.reverse()
			.toArray();
	},

	/**
	 * List reflections by author
	 */
	async listByAuthor(authorId: string, spaceId: string): Promise<Reflection[]> {
		return db.reflections
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((r) => !r.deletedAt && r.authorId === authorId)
			.reverse()
			.toArray();
	},

	/**
	 * List reflections by period (for a date range)
	 */
	async listByPeriod(spaceId: string, start: string, end: string): Promise<Reflection[]> {
		const reflections = await db.reflections
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((r) => !r.deletedAt)
			.toArray();

		return reflections.filter((r) => {
			if (!r.period) return false;
			return r.period.start >= start && r.period.end <= end;
		});
	}
};

// Reflection Template Service
export const reflectionTemplateService = {
	/**
	 * Create a new reflection template
	 */
	async create(input: {
		spaceId: string;
		name: string;
		questions: Array<{ text: string; order: number }>;
	}): Promise<ServiceResult<ReflectionTemplate>> {
		return serviceOperation(async () => {
			if (!input.name?.trim()) {
				return err('VALIDATION_ERROR', 'Template name is required', 'name');
			}
			if (!input.spaceId) {
				return err('VALIDATION_ERROR', 'Space is required', 'spaceId');
			}
			if (!input.questions || input.questions.length === 0) {
				return err('VALIDATION_ERROR', 'At least one question is required', 'questions');
			}

			const timestamps = createTimestamp();
			const template: ReflectionTemplate = {
				id: generateUUIDv7(),
				spaceId: input.spaceId,
				name: input.name.trim(),
				questions: input.questions.map((q) => ({
					id: generateUUIDv7(),
					text: q.text,
					order: q.order
				})),
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.reflectionTemplates.add(template);
			}, 'reflectionTemplate.create');

			return ok(template);
		}, 'reflectionTemplate.create');
	},

	/**
	 * Get a reflection template by ID
	 */
	async get(id: string): Promise<ServiceResult<ReflectionTemplate>> {
		return serviceOperation(async () => {
			const template = await db.reflectionTemplates.get(id);

			if (!template || template.deletedAt) {
				return err('NOT_FOUND', 'Reflection template not found');
			}

			return ok(template);
		}, 'reflectionTemplate.get');
	},

	/**
	 * List templates by space
	 */
	async listBySpace(spaceId: string): Promise<ReflectionTemplate[]> {
		return db.reflectionTemplates
			.where('spaceId')
			.equals(spaceId)
			.and((t) => !t.deletedAt)
			.toArray();
	},

	/**
	 * Soft delete a template
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.reflectionTemplates.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Reflection template not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.reflectionTemplates.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'reflectionTemplate.delete');

			return ok(undefined);
		}, 'reflectionTemplate.delete');
	}
};
