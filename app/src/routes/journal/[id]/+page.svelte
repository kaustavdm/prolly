<script lang="ts">
	import { liveQuery } from 'dexie';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db';
	import { noteService } from '$lib/services';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import type { Note } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';
	import { NoteForm } from '$lib/components/note';
	import { Button, ConfirmDialog, LoadingState, EmptyState } from '$lib/components/ui';

	let noteId = $derived($page.params.id);

	let note = $state<Note | null>(null);
	let loading = $state(true);
	let editing = $state(false);
	let errors = $state<ValidationErrors>({});
	let submitting = $state(false);
	let showDeleteConfirm = $state(false);

	$effect(() => {
		const subscription = liveQuery(() => db.notes.get(noteId)).subscribe({
			next: (value) => {
				note = value && !value.deletedAt ? value : null;
				loading = false;
			},
			error: (err) => {
				console.error(err);
				loading = false;
			}
		});

		return () => subscription.unsubscribe();
	});

	async function handleSubmit(data: { content: string; tags: string[] }) {
		if (!appStore.user || !appStore.personalSpace) return;

		submitting = true;
		errors = {};

		const result = await noteService.update(noteId, {
			content: data.content,
			tags: data.tags
		});

		if (result.success) {
			toastStore.success('Note updated');
			editing = false;
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else {
				toastStore.error(result.error?.message ?? 'Failed to update note');
			}
		}

		submitting = false;
	}

	function handleCancel() {
		editing = false;
		errors = {};
	}

	async function confirmDelete() {
		const result = await noteService.delete(noteId);

		if (result.success) {
			toastStore.success('Note deleted');
			goto('/journal');
		} else {
			toastStore.error(result.error?.message ?? 'Failed to delete note');
		}

		showDeleteConfirm = false;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="page">
	{#if loading}
		<LoadingState message="Loading note..." />
	{:else if !note}
		<EmptyState
			title="Note not found"
			description="This note may have been deleted or doesn't exist."
			actionLabel="Back to Journal"
			actionHref="/journal"
		/>
	{:else if editing}
		<header class="page-header">
			<h1>Edit Note</h1>
		</header>
		<NoteForm {note} {errors} {submitting} onsubmit={handleSubmit} oncancel={handleCancel} />
	{:else}
		<header class="page-header">
			<div class="header-left">
				<a href="/journal" class="back-link">← Journal</a>
			</div>
			<div class="header-actions">
				<Button variant="secondary" onclick={() => (editing = true)}>Edit</Button>
				<Button variant="danger" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
			</div>
		</header>

		<article class="note-content">
			<time class="note-date">{formatDate(note.createdAt)}</time>
			<div class="content">{note.content}</div>
			{#if note.tags && note.tags.length > 0}
				<div class="tags">
					{#each note.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</article>

		<ConfirmDialog
			open={showDeleteConfirm}
			title="Delete Note?"
			message="This note will be permanently deleted. This action cannot be undone."
			confirmLabel="Delete"
			onconfirm={confirmDelete}
			oncancel={() => (showDeleteConfirm = false)}
		/>
	{/if}
</div>

<style>
	.page {
		max-width: 720px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.back-link {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.header-actions {
		display: flex;
		gap: var(--space-2);
	}

	.note-content {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
	}

	.note-date {
		display: block;
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin-bottom: var(--space-4);
	}

	.content {
		font-size: var(--text-base);
		color: var(--text-primary);
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border-default);
	}

	.tag {
		font-size: var(--text-sm);
		color: var(--accent-primary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-md);
	}
</style>
