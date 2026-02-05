<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import { CurriculumCard } from '$lib/components/curriculum';
	import { EmptyState, Button } from '$lib/components/ui';
	import type { Curriculum, Objective } from '$lib/models';

	let curricula = $state<Curriculum[]>([]);
	let objectiveCounts = $state<Map<string, number>>(new Map());

	$effect(() => {
		if (!appStore.personalSpace) return;

		const currSub = liveQuery(() =>
			db.curricula
				.where('spaceId')
				.equals(appStore.personalSpace!.id)
				.and((c) => !c.deletedAt)
				.reverse()
				.sortBy('createdAt')
		).subscribe({
			next: (value) => (curricula = value),
			error: (err) => console.error(err)
		});

		const objSub = liveQuery(() =>
			db.objectives.filter((o) => !o.deletedAt).toArray()
		).subscribe({
			next: (objectives) => {
				const counts = new Map<string, number>();
				for (const obj of objectives) {
					counts.set(obj.curriculumId, (counts.get(obj.curriculumId) || 0) + 1);
				}
				objectiveCounts = counts;
			},
			error: console.error
		});

		return () => {
			currSub.unsubscribe();
			objSub.unsubscribe();
		};
	});
</script>

<div class="page">
	<header class="page-header">
		<h1>Curricula</h1>
		<a href="/curricula/new" class="btn btn-primary">New Curriculum</a>
	</header>

	{#if curricula.length === 0}
		<EmptyState
			title="No curricula yet"
			description="Create your first curriculum to organize your learning objectives."
			actionHref="/curricula/new"
			actionLabel="Create Curriculum"
		/>
	{:else}
		<ul class="curricula-list">
			{#each curricula as curriculum}
				<li>
					<CurriculumCard
						{curriculum}
						objectiveCount={objectiveCounts.get(curriculum.id) || 0}
					/>
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
	}

	.btn-primary {
		background: var(--accent-primary);
		color: white;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.curricula-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
