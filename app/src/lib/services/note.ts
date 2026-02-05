import { db, generateUUIDv7 } from '$lib/db';
import { safeDbOperation } from '$lib/db/errors';
import type { Note, NoteRefs } from '$lib/models';
import {
	ok,
	err,
	createTimestamp,
	updateTimestamp,
	softDeleteFields,
	serviceOperation,
	type ServiceResult,
	type CreateInput,
	type UpdateInput
} from './base';
import { validateNote } from './validation';

export type NoteCreateInput = CreateInput<Note>;
export type NoteUpdateInput = UpdateInput<Note>;

export const noteService = {
	/**
	 * Create a new note
	 */
	async create(input: NoteCreateInput): Promise<ServiceResult<Note>> {
		return serviceOperation(async () => {
			const validation = validateNote(input);
			if (!validation.valid) {
				const firstError = Object.entries(validation.errors)[0];
				return err('VALIDATION_ERROR', firstError[1], firstError[0]);
			}

			const timestamps = createTimestamp();
			const note: Note = {
				id: generateUUIDv7(),
				authorId: input.authorId!,
				spaceId: input.spaceId!,
				content: input.content!,
				refs: input.refs,
				tags: input.tags || [],
				...timestamps,
				version: 1
			};

			await safeDbOperation(async () => {
				await db.notes.add(note);
			}, 'note.create');

			return ok(note);
		}, 'note.create');
	},

	/**
	 * Get a note by ID
	 */
	async get(id: string): Promise<ServiceResult<Note>> {
		return serviceOperation(async () => {
			const note = await db.notes.get(id);

			if (!note || note.deletedAt) {
				return err('NOT_FOUND', 'Note not found');
			}

			return ok(note);
		}, 'note.get');
	},

	/**
	 * Update a note
	 */
	async update(id: string, input: NoteUpdateInput): Promise<ServiceResult<Note>> {
		return serviceOperation(async () => {
			const existing = await db.notes.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Note not found');
			}

			// Validate content if provided
			if (input.content !== undefined) {
				const validation = validateNote({ content: input.content, authorId: existing.authorId, spaceId: existing.spaceId });
				if (!validation.valid) {
					const firstError = Object.entries(validation.errors)[0];
					return err('VALIDATION_ERROR', firstError[1], firstError[0]);
				}
			}

			const updated: Note = {
				...existing,
				...input,
				...updateTimestamp(),
				version: existing.version + 1
			};

			await safeDbOperation(async () => {
				await db.notes.put(updated);
			}, 'note.update');

			return ok(updated);
		}, 'note.update');
	},

	/**
	 * Soft delete a note
	 */
	async delete(id: string): Promise<ServiceResult<void>> {
		return serviceOperation(async () => {
			const existing = await db.notes.get(id);

			if (!existing || existing.deletedAt) {
				return err('NOT_FOUND', 'Note not found');
			}

			const deleteFields = softDeleteFields();

			await safeDbOperation(async () => {
				await db.notes.update(id, {
					...deleteFields,
					version: existing.version + 1
				});
			}, 'note.delete');

			return ok(undefined);
		}, 'note.delete');
	},

	/**
	 * List notes by space
	 */
	async listBySpace(spaceId: string): Promise<Note[]> {
		return db.notes
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((n) => !n.deletedAt)
			.reverse()
			.toArray();
	},

	/**
	 * List notes by author
	 */
	async listByAuthor(authorId: string): Promise<Note[]> {
		return db.notes
			.where('authorId')
			.equals(authorId)
			.and((n) => !n.deletedAt)
			.reverse()
			.sortBy('createdAt');
	},

	/**
	 * List notes by tag
	 */
	async listByTag(spaceId: string, tag: string): Promise<Note[]> {
		return db.notes
			.where('tags')
			.equals(tag)
			.and((n) => n.spaceId === spaceId && !n.deletedAt)
			.toArray();
	},

	/**
	 * List notes attached to a specific entity
	 */
	async listByRef(spaceId: string, refType: keyof NoteRefs, refId: string): Promise<Note[]> {
		const notes = await db.notes
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((n) => !n.deletedAt)
			.reverse()
			.toArray();

		return notes.filter((n) => n.refs?.[refType] === refId);
	},

	/**
	 * Search notes by content
	 */
	async search(spaceId: string, query: string): Promise<Note[]> {
		const lowerQuery = query.toLowerCase();
		return db.notes
			.where('[spaceId+createdAt]')
			.between([spaceId, ''], [spaceId, '\uffff'])
			.and((n) => !n.deletedAt && n.content.toLowerCase().includes(lowerQuery))
			.reverse()
			.toArray();
	},

	/**
	 * Get all unique tags in a space
	 */
	async getAllTags(spaceId: string): Promise<string[]> {
		const notes = await db.notes
			.where('spaceId')
			.equals(spaceId)
			.and((n) => !n.deletedAt)
			.toArray();

		const tagSet = new Set<string>();
		notes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
		return Array.from(tagSet).sort();
	}
};
