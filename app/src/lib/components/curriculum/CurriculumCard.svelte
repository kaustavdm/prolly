<script lang="ts">
	import type { Curriculum } from '$lib/models';

	interface Props {
		curriculum: Curriculum;
		objectiveCount?: number;
	}

	let { curriculum, objectiveCount = 0 }: Props = $props();

	// svelte-ignore state_referenced_locally
	const formattedDate = new Date(curriculum.createdAt).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
</script>

<a href="/curricula/{curriculum.id}" class="curriculum-card">
	<h3>{curriculum.name}</h3>
	{#if curriculum.description}
		<p class="description">{curriculum.description}</p>
	{/if}
	<div class="meta">
		<span class="objective-count">{objectiveCount} objective{objectiveCount !== 1 ? 's' : ''}</span>
		<span class="date">{formattedDate}</span>
	</div>
</a>

<style>
	.curriculum-card {
		display: block;
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.curriculum-card:hover {
		border-color: var(--accent-primary);
	}

	h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-1);
	}

	.description {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-3);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.objective-count {
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}
</style>
