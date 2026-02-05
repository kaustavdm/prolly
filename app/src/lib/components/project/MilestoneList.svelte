<script lang="ts">
	import type { Milestone } from '$lib/models';
	import { Button } from '$lib/components/ui';

	interface Props {
		milestones: Milestone[];
		onAdd?: (milestone: Omit<Milestone, 'id'>) => void;
		onComplete?: (id: string) => void;
		onRemove?: (id: string) => void;
		readonly?: boolean;
	}

	let {
		milestones,
		onAdd,
		onComplete,
		onRemove,
		readonly = false
	}: Props = $props();

	let isAdding = $state(false);
	let newName = $state('');
	let newDescription = $state('');
	let newDueDate = $state('');

	function handleAdd() {
		if (!newName.trim()) return;

		onAdd?.({
			name: newName.trim(),
			description: newDescription.trim() || undefined,
			dueDate: newDueDate || undefined
		});

		// Reset form
		newName = '';
		newDescription = '';
		newDueDate = '';
		isAdding = false;
	}

	function handleCancel() {
		newName = '';
		newDescription = '';
		newDueDate = '';
		isAdding = false;
	}

	function formatDate(date?: string): string {
		if (!date) return '';
		return new Date(date).toLocaleDateString();
	}
</script>

<div class="milestone-list">
	{#if milestones.length === 0 && readonly}
		<p class="empty-message">No milestones yet.</p>
	{:else}
		<ul class="milestones">
			{#each milestones as milestone}
				<li class="milestone-item" class:completed={milestone.completedAt}>
					<div class="milestone-content">
						<div class="milestone-header">
							{#if !readonly && !milestone.completedAt}
								<button
									type="button"
									class="complete-btn"
									onclick={() => onComplete?.(milestone.id)}
									aria-label="Mark as complete"
								>
									○
								</button>
							{:else if milestone.completedAt}
								<span class="completed-icon">✓</span>
							{/if}
							<span class="milestone-name">{milestone.name}</span>
						</div>
						{#if milestone.description}
							<p class="milestone-description">{milestone.description}</p>
						{/if}
						<div class="milestone-meta">
							{#if milestone.dueDate}
								<span class="due-date">Due: {formatDate(milestone.dueDate)}</span>
							{/if}
							{#if milestone.completedAt}
								<span class="completed-date">Completed: {formatDate(milestone.completedAt)}</span>
							{/if}
						</div>
					</div>
					{#if !readonly}
						<button
							type="button"
							class="remove-btn"
							onclick={() => onRemove?.(milestone.id)}
							aria-label="Remove milestone"
						>
							×
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if !readonly}
		{#if isAdding}
			<div class="add-form">
				<input
					type="text"
					placeholder="Milestone name"
					bind:value={newName}
					class="input"
				/>
				<input
					type="text"
					placeholder="Description (optional)"
					bind:value={newDescription}
					class="input"
				/>
				<input
					type="date"
					bind:value={newDueDate}
					class="input"
				/>
				<div class="add-form-actions">
					<Button variant="secondary" size="sm" onclick={handleCancel}>Cancel</Button>
					<Button variant="primary" size="sm" onclick={handleAdd} disabled={!newName.trim()}>
						Add
					</Button>
				</div>
			</div>
		{:else}
			<button type="button" class="add-milestone-btn" onclick={() => (isAdding = true)}>
				+ Add Milestone
			</button>
		{/if}
	{/if}
</div>

<style>
	.milestone-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-message {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		text-align: center;
		padding: var(--space-4);
	}

	.milestones {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.milestone-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
	}

	.milestone-item.completed {
		opacity: 0.7;
	}

	.milestone-item.completed .milestone-name {
		text-decoration: line-through;
	}

	.milestone-content {
		flex: 1;
	}

	.milestone-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.complete-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--text-lg);
		color: var(--text-tertiary);
		padding: 0;
		line-height: 1;
	}

	.complete-btn:hover {
		color: var(--color-success);
	}

	.completed-icon {
		color: var(--color-success);
		font-size: var(--text-lg);
		line-height: 1;
	}

	.milestone-name {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
	}

	.milestone-description {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		margin: var(--space-1) 0 0 var(--space-6);
	}

	.milestone-meta {
		display: flex;
		gap: var(--space-3);
		margin: var(--space-1) 0 0 var(--space-6);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-tertiary);
		font-size: var(--text-lg);
		padding: 0;
		line-height: 1;
	}

	.remove-btn:hover {
		color: var(--color-error);
	}

	.add-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
	}

	.input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.input:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.add-form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.add-milestone-btn {
		width: 100%;
		padding: var(--space-3);
		background: none;
		border: 1px dashed var(--border-default);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.add-milestone-btn:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}
</style>
