<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'class'> {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		type = 'button',
		children,
		...rest
	}: Props = $props();
</script>

<button
	class="btn btn-{variant} btn-{size}"
	{type}
	disabled={disabled || loading}
	{...rest}
>
	{#if loading}
		<span class="spinner"></span>
	{/if}
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 500;
		font-family: inherit;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
		border: 1px solid transparent;
		text-decoration: none;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	/* Sizes */
	.btn-sm {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
	}

	.btn-md {
		padding: var(--space-2) var(--space-4);
	}

	.btn-lg {
		padding: var(--space-3) var(--space-6);
		font-size: var(--text-base);
	}

	/* Variants */
	.btn-primary {
		background: var(--accent-primary);
		color: white;
		border-color: var(--accent-primary);
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary);
		border-color: var(--border-default);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-secondary);
	}

	.btn-ghost {
		background: transparent;
		color: var(--text-secondary);
		border-color: transparent;
	}

	.btn-ghost:hover:not(:disabled) {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.btn-danger {
		background: var(--accent-error);
		color: white;
		border-color: var(--accent-error);
	}

	.btn-danger:hover:not(:disabled) {
		opacity: 0.9;
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
