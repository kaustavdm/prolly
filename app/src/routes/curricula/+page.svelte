<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import type { Curriculum } from '$lib/models';

	let curricula = $state<Curriculum[]>([]);

	$effect(() => {
		if (!appStore.personalSpace) return;

		const subscription = liveQuery(() =>
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

		return () => subscription.unsubscribe();
	});
</script>

<div class="page">
	<header class="page-header">
		<h1>Curricula</h1>
		<a href="/curricula/new" class="btn btn-primary">New Curriculum</a>
	</header>

	{#if curricula.length === 0}
		<div class="empty-state">
			<p>No curricula yet. Create your first curriculum to organize your learning objectives.</p>
			<a href="/curricula/new" class="btn btn-primary">Create Curriculum</a>
		</div>
	{:else}
		<ul class="entity-list">
			{#each curricula as curriculum}
				<li>
					<a href="/curricula/{curriculum.id}" class="entity-card">
						<h3>{curriculum.name}</h3>
						{#if curriculum.description}
							<p>{curriculum.description}</p>
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
		transition: background-color var(--duration-fast) var(--ease-out);
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
		transition: border-color var(--duration-fast) var(--ease-out);
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
</style>
