let counter = 0;
let lastTimestamp = 0;

export function generateUUIDv7(): string {
	let timestamp = Date.now();

	if (timestamp === lastTimestamp) {
		counter++;
	} else {
		counter = 0;
		lastTimestamp = timestamp;
	}

	const timestampHex = timestamp.toString(16).padStart(12, '0');

	const randomBytes = new Uint8Array(10);
	crypto.getRandomValues(randomBytes);

	randomBytes[0] = (randomBytes[0] & 0x0f) | 0x70;
	randomBytes[2] = (randomBytes[2] & 0x3f) | 0x80;

	const randomHex = Array.from(randomBytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8)}-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8)}`;
}

export function extractTimestamp(uuid: string): number {
	const hex = uuid.replace(/-/g, '').slice(0, 12);
	return parseInt(hex, 16);
}
