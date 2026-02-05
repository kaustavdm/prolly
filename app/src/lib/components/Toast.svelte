<script lang="ts">
	import type { ToastType } from '$lib/stores/toast.svelte';

	interface Props {
		id: string;
		type: ToastType;
		message: string;
		ondismiss: (id: string) => void;
	}

	let { id, type, message, ondismiss }: Props = $props();

	const icons: Record<ToastType, string> = {
		success: '✓',
		error: '✕',
		warning: '!',
		info: 'i'
	};
</script>

<div class="toast toast-{type}" role="alert">
	<span class="toast-icon">{icons[type]}</span>
	<p class="toast-message">{message}</p>
	<button class="toast-dismiss" onclick={() => ondismiss(id)} aria-label="Dismiss">
		×
	</button>
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 300px;
		max-width: 450px;
		animation: slideIn var(--duration-normal) var(--ease-out);
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		font-size: var(--text-sm);
		font-weight: 600;
		flex-shrink: 0;
	}

	.toast-success .toast-icon {
		background: rgba(5, 150, 105, 0.1);
		color: var(--accent-success);
	}

	.toast-error .toast-icon {
		background: rgba(220, 38, 38, 0.1);
		color: var(--accent-error);
	}

	.toast-warning .toast-icon {
		background: rgba(217, 119, 6, 0.1);
		color: var(--accent-warning);
	}

	.toast-info .toast-icon {
		background: rgba(37, 99, 235, 0.1);
		color: var(--accent-primary);
	}

	.toast-message {
		flex: 1;
		font-size: var(--text-sm);
		color: var(--text-primary);
		margin: 0;
	}

	.toast-dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--text-tertiary);
		font-size: var(--text-lg);
		cursor: pointer;
		flex-shrink: 0;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.toast-dismiss:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}
</style>
