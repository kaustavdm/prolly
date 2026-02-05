<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { ObjectiveCard } from '$lib/components/objective';
	import { EmptyState, LinkButton } from '$lib/components/ui';
	import type { Objective, Curriculum } from '$lib/models';

	let objectives = $state<Objective[]>([]);
	let curricula = $state<Map<string, Curriculum>>(new Map());

	$effect(() => {
		const objSubscription = liveQuery(() =>
			db.objectives
				.filter((o) => !o.deletedAt)
				.reverse()
				.sortBy('createdAt')
		).subscribe({
			next: (value) => (objectives = value),
			error: (err) => console.error(err)
		});

		const currSubscription = liveQuery(() => db.curricula.toArray()).subscribe({
			next: (value) => {
				const map = new Map<string, Curriculum>();
				value.forEach((c) => map.set(c.id, c));
				curricula = map;
			},
			error: (err) => console.error(err)
		});

		return () => {
			objSubscription.unsubscribe();
			currSubscription.unsubscribe();
		};
	});
</script>

<div class="page">
	<header class="page-header">
		<h1>Objectives</h1>
		<LinkButton href="/objectives/new">New Objective</LinkButton>
	</header>

	{#if objectives.length === 0}
		<EmptyState
			title="No objectives yet"
			description="Create objectives to track your learning goals."
			actionHref="/objectives/new"
			actionLabel="Create Objective"
		/>
	{:else}
		<ul class="entity-list">
			{#each objectives as objective}
				<li>
					<ObjectiveCard {objective} curriculum={curricula.get(objective.curriculumId)} />
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
