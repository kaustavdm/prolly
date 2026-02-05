import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { User, UserSettings } from '$lib/models';
import {
	ok,
	err,
	updateTimestamp,
	serviceOperation,
	type ServiceResult
} from './base';

export interface UserUpdateInput {
	name?: string;
	email?: string;
	avatarUrl?: string;
	settings?: Partial<UserSettings>;
}

export const userService = {
	/**
	 * Get a user by ID
	 */
	async get(id: string): Promise<ServiceResult<User>> {
		return serviceOperation(async () => {
			const user = await db.users.get(id);

			if (!user) {
				return err('NOT_FOUND', 'User not found');
			}

			return ok(user);
		}, 'user.get');
	},

	/**
	 * Update a user's profile
	 */
	async update(id: string, input: UserUpdateInput): Promise<ServiceResult<User>> {
		return serviceOperation(async () => {
			const existing = await db.users.get(id);

			if (!existing) {
				return err('NOT_FOUND', 'User not found');
			}

			// Validate name if provided
			if (input.name !== undefined) {
				const trimmedName = input.name.trim();
				if (!trimmedName) {
					return err('VALIDATION_ERROR', 'Name cannot be empty', 'name');
				}
				if (trimmedName.length > 100) {
					return err('VALIDATION_ERROR', 'Name must be at most 100 characters', 'name');
				}
			}

			// Validate email if provided
			if (input.email !== undefined && input.email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(input.email)) {
					return err('VALIDATION_ERROR', 'Invalid email format', 'email');
				}
			}

			const updated: User = {
				...existing,
				name: input.name?.trim() ?? existing.name,
				email: input.email ?? existing.email,
				avatarUrl: input.avatarUrl ?? existing.avatarUrl,
				settings: input.settings
					? { ...existing.settings, ...input.settings }
					: existing.settings,
				...updateTimestamp()
			};

			await safeDbOperation(async () => {
				await db.users.put(updated);
			}, 'user.update');

			return ok(updated);
		}, 'user.update');
	},

	/**
	 * Update user settings
	 */
	async updateSettings(
		id: string,
		settings: Partial<UserSettings>
	): Promise<ServiceResult<User>> {
		return this.update(id, { settings });
	},

	/**
	 * Get or create a user (for initial setup)
	 */
	async getOrCreate(id: string, name: string): Promise<ServiceResult<User>> {
		return serviceOperation(async () => {
			const existing = await db.users.get(id);

			if (existing) {
				return ok(existing);
			}

			const now = new Date().toISOString();
			const user: User = {
				id,
				name,
				settings: {
					theme: 'system',
					notifications: true,
					defaultSpaceId: undefined
				},
				createdAt: now,
				updatedAt: now
			};

			await safeDbOperation(async () => {
				await db.users.add(user);
			}, 'user.create');

			return ok(user);
		}, 'user.getOrCreate');
	}
};
