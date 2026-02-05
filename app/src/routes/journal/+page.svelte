<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import type { Activity } from '$lib/models';

	let activities = $state<Activity[]>([]);

	$effect(() => {
		if (!appStore.personalSpace) return;

		const subscription = liveQuery(() =>
			db.activities
				.where('[spaceId+createdAt]')
				.between([appStore.personalSpace!.id, ''], [appStore.personalSpace!.id, '\uffff'])
				.reverse()
				.limit(50)
				.toArray()
		).subscribe({
			next: (value) => (activities = value),
			error: (err) => console.error(err)
		});

		return () => subscription.unsubscribe();
	});

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatActivityType(type: string): string {
		return type
			.split('.')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>Journal</h1>
		<a href="/journal/new" class="btn btn-primary">New Entry</a>
	</header>

	{#if activities.length === 0}
		<div class="empty-state">
			<p>No activity yet. Your learning journey will be recorded here.</p>
		</div>
	{:else}
		<ul class="timeline">
			{#each activities as activity}
				<li class="timeline-item">
					<div class="timeline-marker"></div>
					<div class="timeline-content">
						<span class="activity-type">{formatActivityType(activity.type)}</span>
						<time class="activity-time">{formatDate(activity.createdAt)}</time>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.page {
		max-width: 720px;
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

	.timeline {
		list-style: none;
		padding: 0;
		margin: 0;
		position: relative;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 7px;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--border-default);
	}

	.timeline-item {
		position: relative;
		padding-left: var(--space-8);
		padding-bottom: var(--space-4);
	}

	.timeline-marker {
		position: absolute;
		left: 0;
		top: 4px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--bg-primary);
		border: 2px solid var(--accent-primary);
	}

	.timeline-content {
		background: var(--bg-secondary);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-default);
	}

	.activity-type {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
	}

	.activity-time {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}
</style>
