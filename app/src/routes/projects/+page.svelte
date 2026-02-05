<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import { ProjectCard } from '$lib/components/project';
	import { EmptyState, LinkButton } from '$lib/components/ui';
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
</script>

<div class="page">
	<header class="page-header">
		<h1>Projects</h1>
		<LinkButton href="/projects/new">New Project</LinkButton>
	</header>

	{#if projects.length === 0}
		<EmptyState
			title="No projects yet"
			description="Create a project to track larger learning endeavors."
			actionHref="/projects/new"
			actionLabel="Create Project"
		/>
	{:else}
		<ul class="entity-list">
			{#each projects as project}
				<li>
					<ProjectCard {project} />
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

	.entity-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
