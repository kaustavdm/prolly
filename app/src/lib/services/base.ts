import { generateUUIDv7 } from '$lib/db';
import { AppError, safeDbOperation } from '$lib/db/errors';

// Re-export for convenience
export { AppError, safeDbOperation, generateUUIDv7 };

// Error codes used across services
export type ErrorCode =
	| 'STORAGE_FULL'
	| 'CONSTRAINT_ERROR'
	| 'DB_ERROR'
	| 'VALIDATION_ERROR'
	| 'NOT_FOUND'
	| 'DAG_CYCLE'
	| 'INVALID_PREREQUISITE';

// Service result type for consistent error handling
export interface ServiceResult<T> {
	success: boolean;
	data?: T;
	error?: AppError;
}

// Success helper
export function ok<T>(data: T): ServiceResult<T> {
	return { success: true, data };
}

// Error helper
export function err<T>(code: ErrorCode, message: string, field?: string): ServiceResult<T> {
	return { success: false, error: new AppError(code, message, field) };
}

// Timestamp helpers
export function createTimestamp(): { createdAt: string; updatedAt: string } {
	const now = new Date().toISOString();
	return { createdAt: now, updatedAt: now };
}

export function updateTimestamp(): { updatedAt: string } {
	return { updatedAt: new Date().toISOString() };
}

export function softDeleteFields(): { deletedAt: string; updatedAt: string } {
	const now = new Date().toISOString();
	return { deletedAt: now, updatedAt: now };
}

// Input types for create/update operations
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deletedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'deletedAt'>>;

// Wrap service operations with consistent error handling
export async function serviceOperation<T>(
	operation: () => Promise<ServiceResult<T>>,
	context: string
): Promise<ServiceResult<T>> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof AppError) {
			return { success: false, error };
		}
		console.error(`Service error in ${context}:`, error);
		return {
			success: false,
			error: new AppError('DB_ERROR', 'An unexpected error occurred.')
		};
	}
}
