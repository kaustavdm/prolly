export interface StoredBlob {
	id: string;
	data: ArrayBuffer;
	mimeType: string;
	size: number;
	checksum: string;
	refCount: number;
	createdAt: string;
}

export interface LocalSettings {
	key: string;
	value: unknown;
}

export interface UIState {
	key: string;
	value: unknown;
}

export interface SyncQueueItem {
	id?: number;
	entityType: string;
	entityId: string;
	operation: 'create' | 'update' | 'delete';
	payload: unknown;
	createdAt: string;
	attempts: number;
	lastError?: string;
}
