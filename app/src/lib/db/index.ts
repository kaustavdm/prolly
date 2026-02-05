import Dexie, { type Table } from 'dexie';
import type {
	User,
	Space,
	Membership,
	Curriculum,
	Objective,
	Lesson,
	Project,
	Resource,
	Activity,
	Observation,
	Note,
	Feedback,
	Reflection,
	ReflectionTemplate,
	Progress,
	StoredBlob,
	LocalSettings,
	UIState,
	SyncQueueItem
} from '$lib/models';

export class ProllyDB extends Dexie {
	users!: Table<User>;
	spaces!: Table<Space>;
	memberships!: Table<Membership>;
	curricula!: Table<Curriculum>;
	objectives!: Table<Objective>;
	lessons!: Table<Lesson>;
	projects!: Table<Project>;
	resources!: Table<Resource>;
	activities!: Table<Activity>;
	observations!: Table<Observation>;
	notes!: Table<Note>;
	feedback!: Table<Feedback>;
	reflections!: Table<Reflection>;
	reflectionTemplates!: Table<ReflectionTemplate>;
	progress!: Table<Progress>;
	blobs!: Table<StoredBlob>;

	constructor() {
		super('prolly');

		this.version(1).stores({
			users: 'id, email',
			spaces: 'id, ownerId, type',
			memberships: 'id, userId, spaceId, [userId+spaceId]',
			curricula: 'id, spaceId, [spaceId+createdAt]',
			objectives: 'id, curriculumId, [curriculumId+createdAt]',
			lessons: 'id, spaceId, curriculumId, [spaceId+createdAt], *objectiveIds',
			projects: 'id, spaceId, status, [spaceId+createdAt]',
			resources: 'id, spaceId, type, [spaceId+createdAt]',
			activities: 'id, userId, spaceId, type, [userId+createdAt], [spaceId+createdAt], [spaceId+type]',
			observations: 'id, authorId, subjectId, spaceId, [spaceId+createdAt]',
			notes: 'id, authorId, spaceId, [spaceId+createdAt], *tags',
			feedback: 'id, authorId, recipientId, spaceId, [spaceId+createdAt]',
			reflections: 'id, authorId, spaceId, [spaceId+createdAt]',
			reflectionTemplates: 'id, spaceId',
			progress: 'id, userId, objectiveId, [userId+objectiveId], status',
			blobs: 'id, checksum'
		});
	}
}

export class LocalDB extends Dexie {
	settings!: Table<LocalSettings>;
	uiState!: Table<UIState>;
	syncQueue!: Table<SyncQueueItem>;

	constructor() {
		super('prolly-local');

		this.version(1).stores({
			settings: 'key',
			uiState: 'key',
			syncQueue: '++id, entityType, entityId, operation, createdAt'
		});
	}
}

export const db = new ProllyDB();
export const localDb = new LocalDB();

export { generateUUIDv7 } from './uuid';
