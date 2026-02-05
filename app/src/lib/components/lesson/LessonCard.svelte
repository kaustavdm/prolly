<script lang="ts">
	import type { Lesson, Curriculum } from '$lib/models';

	interface Props {
		lesson: Lesson;
		curriculum?: Curriculum | null;
	}

	let { lesson, curriculum = null }: Props = $props();
</script>

<a href="/lessons/{lesson.id}" class="lesson-card">
	<h3>{lesson.name}</h3>
	{#if curriculum}
		<span class="curriculum-tag">{curriculum.name}</span>
	{/if}
	{#if lesson.description}
		<p class="description">{lesson.description}</p>
	{/if}
	<div class="meta">
		{#if lesson.objectiveIds.length > 0}
			<span class="objectives-badge">
				{lesson.objectiveIds.length} objective{lesson.objectiveIds.length !== 1 ? 's' : ''}
			</span>
		{/if}
	</div>
</a>

<style>
	.lesson-card {
		display: block;
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.lesson-card:hover {
		border-color: var(--accent-primary);
	}

	h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-1);
	}

	.curriculum-tag {
		display: inline-block;
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		margin-bottom: var(--space-2);
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
		gap: var(--space-2);
	}

	.objectives-badge {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
