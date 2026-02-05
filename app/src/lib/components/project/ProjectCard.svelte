<script lang="ts">
	import type { Project } from '$lib/models';

	interface Props {
		project: Project;
	}

	let { project }: Props = $props();

	const statusLabels: Record<Project['status'], string> = {
		planning: 'Planning',
		active: 'Active',
		completed: 'Completed',
		archived: 'Archived'
	};

	const statusColors: Record<Project['status'], string> = {
		planning: 'var(--text-tertiary)',
		active: 'var(--color-success)',
		completed: 'var(--accent-primary)',
		archived: 'var(--text-tertiary)'
	};

	const completedMilestones = $derived(
		project.milestones.filter((m) => m.completedAt).length
	);
</script>

<a href="/projects/{project.id}" class="project-card">
	<div class="card-header">
		<h3>{project.name}</h3>
		<span class="status-badge" style="--status-color: {statusColors[project.status]}">
			{statusLabels[project.status]}
		</span>
	</div>
	{#if project.description}
		<p class="description">{project.description}</p>
	{/if}
	<div class="meta">
		{#if project.milestones.length > 0}
			<span class="milestone-count">
				{completedMilestones}/{project.milestones.length} milestones
			</span>
		{/if}
		{#if project.objectiveIds.length > 0}
			<span class="objectives-count">
				{project.objectiveIds.length} objective{project.objectiveIds.length !== 1 ? 's' : ''}
			</span>
		{/if}
	</div>
</a>

<style>
	.project-card {
		display: block;
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.project-card:hover {
		border-color: var(--accent-primary);
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
	}

	.status-badge {
		flex-shrink: 0;
		font-size: var(--text-xs);
		color: var(--status-color);
		background: color-mix(in srgb, var(--status-color) 15%, transparent);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
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
</style>
