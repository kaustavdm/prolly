export type ActivityType =
	| 'objective.started'
	| 'objective.achieved'
	| 'lesson.started'
	| 'lesson.completed'
	| 'project.started'
	| 'project.milestone_completed'
	| 'project.completed'
	| 'resource.viewed'
	| 'custom';

export interface ActivityRefs {
	objectiveId?: string;
	lessonId?: string;
	projectId?: string;
	resourceId?: string;
}

export interface Activity {
	id: string;
	userId: string;
	spaceId: string;
	type: ActivityType;
	payload: Record<string, unknown>;
	refs: ActivityRefs;
	parentId?: string;
	createdAt: string;
}

export interface ObservationRefs {
	objectiveId?: string;
	lessonId?: string;
	projectId?: string;
	activityId?: string;
}

export interface Observation {
	id: string;
	authorId: string;
	subjectId?: string;
	spaceId: string;
	type: 'self' | 'peer' | 'learner';
	content: string;
	refs: ObservationRefs;
	createdAt: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}

export interface NoteRefs {
	curriculumId?: string;
	objectiveId?: string;
	lessonId?: string;
	projectId?: string;
	resourceId?: string;
}

export interface Note {
	id: string;
	authorId: string;
	spaceId: string;
	content: string;
	refs?: NoteRefs;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}

export interface FeedbackRefs {
	activityId?: string;
	projectId?: string;
	lessonId?: string;
	observationId?: string;
}

export interface Feedback {
	id: string;
	authorId: string;
	recipientId: string;
	spaceId: string;
	content: string;
	type: 'praise' | 'suggestion' | 'question' | 'general';
	refs: FeedbackRefs;
	createdAt: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}

export interface ReflectionResponse {
	questionId: string;
	question: string;
	answer: string;
}

export interface Reflection {
	id: string;
	authorId: string;
	spaceId: string;
	templateId?: string;
	responses: ReflectionResponse[];
	period?: {
		start: string;
		end: string;
	};
	createdAt: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}

export interface ReflectionQuestion {
	id: string;
	text: string;
	order: number;
}

export interface ReflectionTemplate {
	id: string;
	spaceId: string;
	name: string;
	questions: ReflectionQuestion[];
	createdAt: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}

export interface Progress {
	id: string;
	userId: string;
	objectiveId: string;
	status: 'not_started' | 'in_progress' | 'achieved';
	achievedAt?: string;
	notes?: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}
