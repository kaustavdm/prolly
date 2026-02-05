<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import type { Objective, Curriculum } from '$lib/models';

	interface Props {
		spaceId?: string;
		curriculumId?: string;
		value?: string[];
		error?: string | null;
	}

	let {
		spaceId = '',
		curriculumId = '',
		value = $bindable([]),
		error = null
	}: Props = $props();

	let objectives = $state<Objective[]>([]);
	let curricula = $state<Map<string, Curriculum>>(new Map());
	let searchQuery = $state('');

	$effect(() => {
		// Load objectives based on curriculumId or all in space
		const objSubscription = liveQuery(() => {
			if (curriculumId) {
				return db.objectives
					.where('curriculumId')
					.equals(curriculumId)
					.and((o) => !o.deletedAt)
					.toArray();
			}
			// If no curriculum specified, get all objectives
			return db.objectives.filter((o) => !o.deletedAt).toArray();
		}).subscribe({
			next: (v) => (objectives = v),
			error: console.error
		});

		// Load curricula for display
		const currSubscription = liveQuery(() => db.curricula.toArray()).subscribe({
			next: (value) => {
				const map = new Map<string, Curriculum>();
				value.forEach((c) => map.set(c.id, c));
				curricula = map;
			},
			error: console.error
		});

		return () => {
			objSubscription.unsubscribe();
			currSubscription.unsubscribe();
		};
	});

	let filteredObjectives = $derived(
		objectives.filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
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

	function getCurriculumName(currId: string): string | undefined {
		return curricula.get(currId)?.name;
	}
</script>

<div class="objective-selector" class:has-error={error}>
	{#if filteredObjectives.length === 0 && !searchQuery}
		<p class="empty-message">
			{curriculumId
				? 'No objectives in this curriculum yet.'
				: 'No objectives available. Create objectives first.'}
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
						<span class="objective-info">
							<span class="objective-name">{objective.name}</span>
							{#if !curriculumId}
								<span class="curriculum-name">{getCurriculumName(objective.curriculumId)}</span>
							{/if}
						</span>
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
					<button type="button" onclick={() => toggleObjective(id)} aria-label="Remove">×</button>
				</span>
			{/each}
		</div>
	{/if}

	{#if error}
		<p class="error-message">{error}</p>
	{/if}
</div>

<style>
	.objective-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.objective-selector.has-error .search-input {
		border-color: var(--color-error);
	}

	.empty-message {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		padding: var(--space-4);
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		text-align: center;
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
		box-shadow: 0 0 0 2px var(--accent-primary-alpha);
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
		font-size: var(--text-sm);
		border-bottom: 1px solid var(--border-default);
	}

	.objective-item:last-child {
		border-bottom: none;
	}

	.objective-item:hover {
		background: var(--bg-secondary);
	}

	.objective-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.objective-name {
		color: var(--text-primary);
	}

	.curriculum-name {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
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
		font-size: var(--text-xs);
		background: var(--accent-primary-alpha);
		color: var(--accent-primary);
		border-radius: var(--radius-sm);
	}

	.tag button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		font-size: var(--text-sm);
		line-height: 1;
	}

	.tag button:hover {
		color: var(--text-primary);
	}

	.error-message {
		font-size: var(--text-sm);
		color: var(--color-error);
	}
</style>
