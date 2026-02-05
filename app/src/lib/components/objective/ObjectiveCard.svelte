<script lang="ts">
	import type { Objective, Curriculum } from '$lib/models';

	interface Props {
		objective: Objective;
		curriculum?: Curriculum | null;
	}

	let { objective, curriculum = null }: Props = $props();
</script>

<a href="/objectives/{objective.id}" class="objective-card">
	<h3>{objective.name}</h3>
	{#if curriculum}
		<span class="curriculum-tag">{curriculum.name}</span>
	{/if}
	{#if objective.description}
		<p class="description">{objective.description}</p>
	{/if}
	<div class="meta">
		{#if objective.prerequisites.length > 0}
			<span class="prereq-badge">
				{objective.prerequisites.length} prerequisite{objective.prerequisites.length !== 1
					? 's'
					: ''}
			</span>
		{/if}
	</div>
</a>

<style>
	.objective-card {
		display: block;
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.objective-card:hover {
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

	.prereq-badge {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
