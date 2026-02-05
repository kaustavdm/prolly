// Validation result type
export interface ValidationResult {
	valid: boolean;
	message?: string;
	field?: string;
}

// Validation error collection
export interface ValidationErrors {
	[field: string]: string;
}

// Generic validator type
export type Validator<T> = (input: T) => ValidationResult;

// Composable validation helpers
export function required(value: unknown, fieldName: string): ValidationResult {
	if (value === undefined || value === null || value === '') {
		return { valid: false, message: `${fieldName} is required`, field: fieldName };
	}
	return { valid: true };
}

export function maxLength(value: string | undefined, max: number, fieldName: string): ValidationResult {
	if (value && value.length > max) {
		return { valid: false, message: `${fieldName} must be at most ${max} characters`, field: fieldName };
	}
	return { valid: true };
}

export function minLength(value: string | undefined, min: number, fieldName: string): ValidationResult {
	if (value && value.length < min) {
		return { valid: false, message: `${fieldName} must be at least ${min} characters`, field: fieldName };
	}
	return { valid: true };
}

export function isUUID(value: string | undefined, fieldName: string): ValidationResult {
	if (!value) return { valid: true }; // Let required() handle this
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(value)) {
		return { valid: false, message: `${fieldName} must be a valid UUID`, field: fieldName };
	}
	return { valid: true };
}

// Run multiple validators and collect all errors
export function validateAll(
	...validators: (() => ValidationResult)[]
): { valid: boolean; errors: ValidationErrors } {
	const errors: ValidationErrors = {};

	for (const validate of validators) {
		const result = validate();
		if (!result.valid && result.field && result.message) {
			errors[result.field] = result.message;
		}
	}

	return { valid: Object.keys(errors).length === 0, errors };
}

// Entity validation functions

export interface CurriculumInput {
	name?: string;
	description?: string;
	spaceId?: string;
}

export function validateCurriculum(input: CurriculumInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.name, 'name'),
		() => maxLength(input.name, 200, 'name'),
		() => required(input.spaceId, 'spaceId'),
		() => maxLength(input.description, 2000, 'description')
	);
}

export interface ObjectiveInput {
	name?: string;
	description?: string;
	curriculumId?: string;
	prerequisites?: string[];
}

export function validateObjective(input: ObjectiveInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.name, 'name'),
		() => maxLength(input.name, 200, 'name'),
		() => required(input.curriculumId, 'curriculumId'),
		() => maxLength(input.description, 2000, 'description')
	);
}

export interface LessonInput {
	name?: string;
	description?: string;
	content?: string;
	spaceId?: string;
	curriculumId?: string;
	objectiveIds?: string[];
}

export function validateLesson(input: LessonInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.name, 'name'),
		() => maxLength(input.name, 200, 'name'),
		() => required(input.spaceId, 'spaceId'),
		() => maxLength(input.description, 2000, 'description')
	);
}

export interface ProjectInput {
	name?: string;
	description?: string;
	spaceId?: string;
	status?: string;
}

export function validateProject(input: ProjectInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.name, 'name'),
		() => maxLength(input.name, 200, 'name'),
		() => required(input.spaceId, 'spaceId'),
		() => maxLength(input.description, 2000, 'description')
	);
}

export interface NoteInput {
	content?: string;
	authorId?: string;
	spaceId?: string;
	tags?: string[];
}

export function validateNote(input: NoteInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.content, 'content'),
		() => maxLength(input.content, 10000, 'content'),
		() => required(input.authorId, 'authorId'),
		() => required(input.spaceId, 'spaceId')
	);
}

export interface ObservationInput {
	content?: string;
	authorId?: string;
	spaceId?: string;
	type?: 'self' | 'peer' | 'learner';
}

export function validateObservation(input: ObservationInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.content, 'content'),
		() => maxLength(input.content, 10000, 'content'),
		() => required(input.authorId, 'authorId'),
		() => required(input.spaceId, 'spaceId'),
		() => required(input.type, 'type')
	);
}

export interface ResourceInput {
	name?: string;
	spaceId?: string;
	type?: 'link' | 'file' | 'image' | 'video' | 'document';
	url?: string;
}

export function validateResource(input: ResourceInput): { valid: boolean; errors: ValidationErrors } {
	return validateAll(
		() => required(input.name, 'name'),
		() => maxLength(input.name, 200, 'name'),
		() => required(input.spaceId, 'spaceId'),
		() => required(input.type, 'type')
	);
}
