import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Observation, ObservationRefs } from '$lib/models';
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
import { validateObservation } from './validation';

export type ObservationCreateInput = CreateInput<Observation>;
export type ObservationUpdateInput = UpdateInput<Observation>;

export const observationService = {
	/**
	 * Create a new observation
	 */
	async create(input: ObservationCreateInput): Promise<ServiceResult<Observation>> {
		return serviceOperation(async () => {
			const validation = validateObservation(input);
			if (!validation.valid) {
				const firstError = Object.entries(validation.errors)[0];
				return err('VALIDATION_ERROR', firstError[1], firstError[0]);
			}

			const timestamps = createTimestamp();
			// Spread refs to create plain object copy (Svelte 5 reactive state uses Proxies that can't be cloned)
			const observation: Observation = {
				id: generateUUIDv7(),
				authorId: input.authorId!,
				subjectId: input.subjectId,
				spaceId: input.spaceId!,
				type: input.type!,
				content: input.content!,
				refs: input.refs ? { ...input.refs } : {},
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.observations.add(observation);
			}, 'observation.create');

			return ok(observation);
		}, 'observation.create');
	},

	/**
	 * Get an observation by ID
	 */
	async get(id: string): Promise<ServiceResult<Observation>> {
		return serviceOperation(async () => {
			const observation = await db.observations.get(id);

			if (!observation || observation.deletedAt) {
				return err('NOT_FOUND', 'Observation not found');
			}

			return ok(observation);
		}, 'observation.get');
	},

	/**
	 * Update an observation
	 */
	async update(id: string, input: ObservationUpdateInput): Promise<ServiceResult<Observation>> {
		return serviceOperation(async () => {
			const existing = await db.observations.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Observation not found');
			}

			// Validate content if provided
			if (input.content !== undefined) {
				const validation = validateObservation({
					content: input.content,
					authorId: existing.authorId,
					spaceId: existing.spaceId,
					type: existing.type
				});
				if (!validation.valid) {
					const firstError = Object.entries(validation.errors)[0];
					return err('VALIDATION_ERROR', firstError[1], firstError[0]);
				}
			}

			// Create plain object copy to avoid Proxy issues with IndexedDB
			const updated: Observation = {
				...existing,
				authorId: input.authorId ?? existing.authorId,
				subjectId: input.subjectId ?? existing.subjectId,
				spaceId: input.spaceId ?? existing.spaceId,
				type: input.type ?? existing.type,
				content: input.content ?? existing.content,
				refs: input.refs ? { ...input.refs } : existing.refs,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.observations.put(updated);
			}, 'observation.update');

			return ok(updated);
		}, 'observation.update');
	},

	/**
	 * Soft delete an observation
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.observations.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Observation not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.observations.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'observation.delete');

			return ok(undefined);
		}, 'observation.delete');
	},

	/**
	 * List observations by space
	 */
	async listBySpace(spaceId: string): Promise<Observation[]> {
		return db.observations
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((o) => !o.deletedAt)
			.reverse()
			.toArray();
	},

	/**
	 * List self-observations by author
	 */
	async listSelfObservations(authorId: string, spaceId: string): Promise<Observation[]> {
		return db.observations
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((o) => !o.deletedAt && o.authorId === authorId && o.type === 'self')
			.reverse()
			.toArray();
	},

	/**
	 * List observations about a subject (user)
	 */
	async listBySubject(subjectId: string, spaceId: string): Promise<Observation[]> {
		return db.observations
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((o) => !o.deletedAt && o.subjectId === subjectId)
			.reverse()
			.toArray();
	},

	/**
	 * List observations by type
	 */
	async listByType(
		spaceId: string,
		type: Observation['type']
	): Promise<Observation[]> {
		return db.observations
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((o) => !o.deletedAt && o.type === type)
			.reverse()
			.toArray();
	},

	/**
	 * List observations attached to a specific entity
	 */
	async listByRef(
		spaceId: string,
		refType: keyof ObservationRefs,
		refId: string
	): Promise<Observation[]> {
		const observations = await db.observations
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((o) => !o.deletedAt)
			.reverse()
			.toArray();

		return observations.filter((o) => o.refs[refType] === refId);
	}
};
