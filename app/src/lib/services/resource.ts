import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Resource } from '$lib/models';
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
import { validateResource } from './validation';

export type ResourceCreateInput = CreateInput<Resource>;
export type ResourceUpdateInput = UpdateInput<Resource>;

export const resourceService = {
	/**
	 * Create a new resource
	 */
	async create(input: ResourceCreateInput): Promise<ServiceResult<Resource>> {
		return serviceOperation(async () => {
			const validation = validateResource(input);
			if (!validation.valid) {
				const firstError = Object.entries(validation.errors)[0];
				return err('VALIDATION_ERROR', firstError[1], firstError[0]);
			}

			const timestamps = createTimestamp();
			const resource: Resource = {
				id: generateUUIDv7(),
				spaceId: input.spaceId!,
				name: input.name!,
				type: input.type!,
				url: input.url,
				blobId: input.blobId,
				mimeType: input.mimeType,
				metadata: input.metadata ? { ...input.metadata } : {},
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.resources.add(resource);
			}, 'resource.create');

			return ok(resource);
		}, 'resource.create');
	},

	/**
	 * Get a resource by ID
	 */
	async get(id: string): Promise<ServiceResult<Resource>> {
		return serviceOperation(async () => {
			const resource = await db.resources.get(id);

			if (!resource || resource.deletedAt) {
				return err('NOT_FOUND', 'Resource not found');
			}

			return ok(resource);
		}, 'resource.get');
	},

	/**
	 * Update a resource
	 */
	async update(id: string, input: ResourceUpdateInput): Promise<ServiceResult<Resource>> {
		return serviceOperation(async () => {
			const existing = await db.resources.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Resource not found');
			}

			// Validate name if provided
			if (input.name !== undefined) {
				const validation = validateResource({
					name: input.name,
					spaceId: existing.spaceId,
					type: existing.type
				});
				if (!validation.valid) {
					const firstError = Object.entries(validation.errors)[0];
					return err('VALIDATION_ERROR', firstError[1], firstError[0]);
				}
			}

			// Create plain object copy to avoid Proxy issues with IndexedDB
			const updated: Resource = {
				...existing,
				spaceId: input.spaceId ?? existing.spaceId,
				name: input.name ?? existing.name,
				type: input.type ?? existing.type,
				url: input.url ?? existing.url,
				blobId: input.blobId ?? existing.blobId,
				mimeType: input.mimeType ?? existing.mimeType,
				metadata: input.metadata ? { ...input.metadata } : existing.metadata,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.resources.put(updated);
			}, 'resource.update');

			return ok(updated);
		}, 'resource.update');
	},

	/**
	 * Soft delete a resource
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.resources.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Resource not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.resources.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'resource.delete');

			return ok(undefined);
		}, 'resource.delete');
	},

	/**
	 * List resources by space
	 */
	async listBySpace(spaceId: string): Promise<Resource[]> {
		return db.resources
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((r) => !r.deletedAt)
			.reverse()
			.toArray();
	},

	/**
	 * List resources by type
	 */
	async listByType(spaceId: string, type: Resource['type']): Promise<Resource[]> {
		return db.resources
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((r) => !r.deletedAt && r.type === type)
			.reverse()
			.toArray();
	},

	/**
	 * Get resources by IDs
	 */
	async getByIds(ids: string[]): Promise<Resource[]> {
		if (ids.length === 0) return [];
		const resources = await db.resources.bulkGet(ids);
		return resources.filter((r): r is Resource => r !== undefined && !r.deletedAt);
	}
};
