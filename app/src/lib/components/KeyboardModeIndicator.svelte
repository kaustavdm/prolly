<script lang="ts">
	import { keyboardStore } from '$lib/stores/keyboard.svelte';

	const modeLabels: Record<string, string> = {
		new: 'NEW',
		go: 'GO',
		edit: 'EDIT',
		delete: 'DELETE',
		search: 'SEARCH',
		view: 'VIEW',
		mark: 'MARK'
	};
</script>

{#if keyboardStore.modeDisplay}
	<div class="mode-indicator" role="status" aria-live="polite">
		<span class="mode-label">{modeLabels[keyboardStore.modeDisplay.mode] || keyboardStore.modeDisplay.mode.toUpperCase()}</span>
		{#if keyboardStore.modeDisplay.pending}
			<span class="pending-keys">{keyboardStore.modeDisplay.pending}</span>
		{/if}
		<span class="hint">Press key to continue or Esc to cancel</span>
	</div>
{/if}

<style>
	.mode-indicator {
		position: fixed;
		bottom: var(--space-4);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-4);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		z-index: 900;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.mode-label {
		font-weight: 600;
		color: var(--accent-primary);
		font-family: var(--font-mono);
	}

	.pending-keys {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.hint {
		color: var(--text-tertiary);
		font-size: var(--text-xs);
	}
</style>
