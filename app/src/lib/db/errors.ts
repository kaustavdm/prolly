import { Dexie } from 'dexie';

export class AppError extends Error {
	constructor(
		public code: string,
		message: string
	) {
		super(message);
		this.name = 'AppError';
	}
}

export async function safeDbOperation<T>(
	operation: () => Promise<T>,
	context: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof Dexie.QuotaExceededError) {
			throw new AppError('STORAGE_FULL', 'Device storage is full. Please free up space.');
		}
		if (error instanceof Dexie.ConstraintError) {
			console.error(`Constraint violation in ${context}:`, error);
			throw new AppError('CONSTRAINT_ERROR', 'Data conflict detected.');
		}
		if (error instanceof Dexie.AbortError) {
			console.warn(`Transaction aborted in ${context}, may retry`);
			throw error;
		}
		console.error(`Database error in ${context}:`, error);
		throw new AppError('DB_ERROR', 'An unexpected error occurred.');
	}
}
