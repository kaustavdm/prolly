<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import type { Progress, Objective } from '$lib/models';

	let progressEntries = $state<Progress[]>([]);
	let objectives = $state<Map<string, Objective>>(new Map());

	$effect(() => {
		if (!appStore.user) return;

		const progressSub = liveQuery(() =>
			db.progress.where('userId').equals(appStore.user!.id).toArray()
		).subscribe({
			next: (value) => (progressEntries = value),
			error: (err) => console.error(err)
		});

		const objSub = liveQuery(() => db.objectives.toArray()).subscribe({
			next: (value) => {
				const map = new Map<string, Objective>();
				value.forEach((o) => map.set(o.id, o));
				objectives = map;
			},
			error: (err) => console.error(err)
		});

		return () => {
			progressSub.unsubscribe();
			objSub.unsubscribe();
		};
	});

	let stats = $derived({
		total: progressEntries.length,
		achieved: progressEntries.filter((p) => p.status === 'achieved').length,
		inProgress: progressEntries.filter((p) => p.status === 'in_progress').length,
		notStarted: progressEntries.filter((p) => p.status === 'not_started').length
	});
</script>

<div class="page">
	<header class="page-header">
		<h1>Progress</h1>
	</header>

	<section class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{stats.achieved}</span>
			<span class="stat-label">Achieved</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.inProgress}</span>
			<span class="stat-label">In Progress</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{stats.notStarted}</span>
			<span class="stat-label">Not Started</span>
		</div>
	</section>

	{#if progressEntries.length === 0}
		<div class="empty-state">
			<p>No progress tracked yet. Start working on objectives to see your progress here.</p>
		</div>
	{:else}
		<section class="progress-list">
			<h2>Objectives Progress</h2>
			<ul>
				{#each progressEntries as entry}
					<li class="progress-item">
						<span class="objective-name">{objectives.get(entry.objectiveId)?.name || 'Unknown'}</span>
						<span class="status-badge status-{entry.status.replace('_', '-')}">{entry.status.replace('_', ' ')}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.page {
		max-width: 960px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stat-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--text-primary);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
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
	}

	.progress-list {
		margin-top: var(--space-8);
	}

	.progress-list h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.progress-list ul {
		list-style: none;
		padding: 0;
	}

	.progress-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
	}

	.objective-name {
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.status-badge {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		text-transform: capitalize;
	}

	.status-achieved {
		background: rgba(5, 150, 105, 0.1);
		color: var(--accent-success);
	}

	.status-in-progress {
		background: rgba(37, 99, 235, 0.1);
		color: var(--accent-primary);
	}

	.status-not-started {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
	}
</style>
