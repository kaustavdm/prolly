<script lang="ts">
	import type { Note } from '$lib/models';

	interface Props {
		note: Note;
	}

	let { note }: Props = $props();

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<a href="/journal/{note.id}" class="note-card">
	<div class="content">{note.content}</div>
	<div class="meta">
		<span class="date">{formatDate(note.createdAt)}</span>
		{#if note.tags && note.tags.length > 0}
			<div class="tags">
				{#each note.tags.slice(0, 3) as tag}
					<span class="tag">{tag}</span>
				{/each}
				{#if note.tags.length > 3}
					<span class="more">+{note.tags.length - 3}</span>
				{/if}
			</div>
		{/if}
	</div>
</a>

<style>
	.note-card {
		display: block;
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.note-card:hover {
		border-color: var(--accent-primary);
	}

	.content {
		font-size: var(--text-sm);
		color: var(--text-primary);
		margin-bottom: var(--space-3);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		white-space: pre-wrap;
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.date {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.tags {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-wrap: wrap;
	}

	.tag {
		font-size: var(--text-xs);
		color: var(--accent-primary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.more {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
