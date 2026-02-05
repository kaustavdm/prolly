<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import type { Objective } from '$lib/models';

	interface Props {
		curriculumId: string;
		excludeId?: string;
		value?: string[];
		error?: string | null;
	}

	let { curriculumId, excludeId = '', value = $bindable([]), error = null }: Props = $props();

	let objectives = $state<Objective[]>([]);
	let searchQuery = $state('');

	$effect(() => {
		if (!curriculumId) {
			objectives = [];
			return;
		}

		const subscription = liveQuery(() =>
			db.objectives
				.where('curriculumId')
				.equals(curriculumId)
				.and((o) => !o.deletedAt)
				.toArray()
		).subscribe({
			next: (v) => (objectives = v),
			error: console.error
		});

		return () => subscription.unsubscribe();
	});

	let filteredObjectives = $derived(
		objectives.filter(
			(o) =>
				o.id !== excludeId && o.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function toggleObjective(id: string) {
		if (value.includes(id)) {
			value = value.filter((v) => v !== id);
		} else {
			value = [...value, id];
		}
	}

	function getObjectiveName(id: string): string {
		return objectives.find((o) => o.id === id)?.name || 'Unknown';
	}
</script>

<div class="prerequisite-selector" class:has-error={error}>
	{#if filteredObjectives.length === 0 && !searchQuery}
		<p class="empty-message">
			{curriculumId ? 'No other objectives in this curriculum yet.' : 'Select a curriculum first.'}
		</p>
	{:else}
		<input
			type="text"
			placeholder="Search objectives..."
			bind:value={searchQuery}
			class="search-input"
		/>

		<ul class="objective-list">
			{#each filteredObjectives as objective}
				<li>
					<label class="objective-item">
						<input
							type="checkbox"
							checked={value.includes(objective.id)}
							onchange={() => toggleObjective(objective.id)}
						/>
						<span>{objective.name}</span>
					</label>
				</li>
			{/each}
		</ul>
	{/if}

	{#if value.length > 0}
		<div class="selected-tags">
			{#each value as id}
				<span class="tag">
					{getObjectiveName(id)}
					<button type="button" onclick={() => toggleObjective(id)} aria-label="Remove"
						>×</button
					>
				</span>
			{/each}
		</div>
	{/if}

	{#if error}
		<p class="error-text">{error}</p>
	{/if}
</div>

<style>
	.prerequisite-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.empty-message {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		padding: var(--space-3);
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: var(--focus-ring);
	}

	.objective-list {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
	}

	.objective-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.objective-item:hover {
		background: var(--bg-secondary);
	}

	.objective-item input[type='checkbox'] {
		accent-color: var(--accent-primary);
	}

	.objective-item span {
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--text-primary);
	}

	.tag button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		background: transparent;
		border: none;
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		cursor: pointer;
		border-radius: var(--radius-sm);
	}

	.tag button:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.error-text {
		font-size: var(--text-sm);
		color: var(--accent-error);
	}

	.has-error .objective-list {
		border-color: var(--accent-error);
	}
</style>
