<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import type { Project } from '$lib/models';

	let projects = $state<Project[]>([]);

	$effect(() => {
		if (!appStore.personalSpace) return;

		const subscription = liveQuery(() =>
			db.projects
				.where('spaceId')
				.equals(appStore.personalSpace!.id)
				.and((p) => !p.deletedAt)
				.reverse()
				.sortBy('createdAt')
		).subscribe({
			next: (value) => (projects = value),
			error: (err) => console.error(err)
		});

		return () => subscription.unsubscribe();
	});

	const statusLabels: Record<string, string> = {
		planning: 'Planning',
		active: 'Active',
		completed: 'Completed',
		archived: 'Archived'
	};
</script>

<div class="page">
	<header class="page-header">
		<h1>Projects</h1>
		<a href="/projects/new" class="btn btn-primary">New Project</a>
	</header>

	{#if projects.length === 0}
		<div class="empty-state">
			<p>No projects yet. Create a project to track larger learning endeavors.</p>
			<a href="/projects/new" class="btn btn-primary">Create Project</a>
		</div>
	{:else}
		<ul class="entity-list">
			{#each projects as project}
				<li>
					<a href="/projects/{project.id}" class="entity-card">
						<div class="card-header">
							<h3>{project.name}</h3>
							<span class="status-badge status-{project.status}">{statusLabels[project.status]}</span>
						</div>
						{#if project.description}
							<p>{project.description}</p>
						{/if}
						{#if project.milestones.length > 0}
							<div class="milestones-count">
								{project.milestones.filter((m) => m.completedAt).length}/{project.milestones.length} milestones
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.page {
		max-width: 960px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: none;
	}

	.btn-primary {
		background: var(--accent-primary);
		color: white;
	}

	.btn-primary:hover {
		opacity: 0.9;
		text-decoration: none;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-12);
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--border-default);
	}

	.empty-state p {
		color: var(--text-secondary);
		margin-bottom: var(--space-4);
	}

	.entity-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.entity-card {
		display: block;
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		text-decoration: none;
	}

	.entity-card:hover {
		border-color: var(--accent-primary);
		text-decoration: none;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}

	.entity-card h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
	}

	.entity-card p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-2);
	}

	.status-badge {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.status-planning {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.status-active {
		background: rgba(37, 99, 235, 0.1);
		color: var(--accent-primary);
	}

	.status-completed {
		background: rgba(5, 150, 105, 0.1);
		color: var(--accent-success);
	}

	.status-archived {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
	}

	.milestones-count {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
