import { db } from './index';
import { generateUUIDv7 } from './uuid';

export async function computeChecksum(buffer: ArrayBuffer): Promise<string> {
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function storeBlob(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const checksum = await computeChecksum(buffer);

	const existing = await db.blobs.where('checksum').equals(checksum).first();
	if (existing) {
		await db.blobs.update(existing.id, { refCount: existing.refCount + 1 });
		return existing.id;
	}

	const id = generateUUIDv7();
	await db.blobs.add({
		id,
		data: buffer,
		mimeType: file.type,
		size: buffer.byteLength,
		checksum,
		refCount: 1,
		createdAt: new Date().toISOString()
	});

	return id;
}

export async function getBlobUrl(id: string): Promise<string | null> {
	const storedBlob = await db.blobs.get(id);
	if (!storedBlob) return null;

	const nativeBlob = new Blob([storedBlob.data], { type: storedBlob.mimeType });
	return URL.createObjectURL(nativeBlob);
}

export async function releaseBlob(id: string): Promise<void> {
	const blob = await db.blobs.get(id);
	if (!blob) return;

	if (blob.refCount <= 1) {
		await db.blobs.delete(id);
	} else {
		await db.blobs.update(id, { refCount: blob.refCount - 1 });
	}
}

export async function cleanupOrphanedBlobs(): Promise<number> {
	const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
	const orphans = await db.blobs
		.filter((blob) => blob.refCount === 0 && blob.createdAt < cutoff)
		.toArray();

	await db.blobs.bulkDelete(orphans.map((b) => b.id));
	return orphans.length;
}
