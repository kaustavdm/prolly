import type { BaseEntity, Role, UserSettings, SpaceSettings } from './base';

export interface User extends Omit<BaseEntity, 'version' | 'deletedAt'> {
	name: string;
	email?: string;
	avatarUrl?: string;
	settings: UserSettings;
}

export interface Space extends BaseEntity {
	name: string;
	description?: string;
	type: 'personal' | 'class' | 'cohort' | 'project' | 'custom';
	ownerId: string;
	settings: SpaceSettings;
}

export interface Membership extends Omit<BaseEntity, 'version' | 'deletedAt'> {
	userId: string;
	spaceId: string;
	roles: Role[];
	joinedAt: string;
}

export interface Curriculum extends BaseEntity {
	spaceId: string;
	name: string;
	description?: string;
	metadata?: Record<string, unknown>;
}

export interface Objective extends BaseEntity {
	curriculumId: string;
	name: string;
	description?: string;
	prerequisites: string[];
	metadata?: Record<string, unknown>;
}

export interface Lesson extends BaseEntity {
	spaceId: string;
	curriculumId?: string;
	name: string;
	description?: string;
	content?: string;
	objectiveIds: string[];
	resourceIds: string[];
	order?: number;
}

export interface Milestone {
	id: string;
	name: string;
	description?: string;
	dueDate?: string;
	completedAt?: string;
}

export interface Project extends BaseEntity {
	spaceId: string;
	name: string;
	description?: string;
	objectiveIds: string[];
	milestones: Milestone[];
	status: 'planning' | 'active' | 'completed' | 'archived';
}

export interface Resource extends BaseEntity {
	spaceId: string;
	name: string;
	type: 'link' | 'file' | 'image' | 'video' | 'document';
	url?: string;
	blobId?: string;
	mimeType?: string;
	metadata?: Record<string, unknown>;
}
