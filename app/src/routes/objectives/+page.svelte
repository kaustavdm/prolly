<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
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
		<a href="/objectives/new" class="btn btn-primary">New Objective</a>
	</header>

	{#if objectives.length === 0}
		<div class="empty-state">
			<p>No objectives yet. Create objectives to track your learning goals.</p>
			<a href="/objectives/new" class="btn btn-primary">Create Objective</a>
		</div>
	{:else}
		<ul class="entity-list">
			{#each objectives as objective}
				<li>
					<a href="/objectives/{objective.id}" class="entity-card">
						<h3>{objective.name}</h3>
						{#if curricula.get(objective.curriculumId)}
							<span class="curriculum-tag">{curricula.get(objective.curriculumId)?.name}</span>
						{/if}
						{#if objective.description}
							<p>{objective.description}</p>
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

	.entity-card h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-1);
	}

	.entity-card p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
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
</style>
