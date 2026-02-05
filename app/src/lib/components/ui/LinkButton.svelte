<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAnchorAttributes, 'class'> {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		href: string;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		children,
		...rest
	}: Props = $props();
</script>

<a class="link-btn link-btn-{variant} link-btn-{size}" {href} {...rest}>
	{@render children()}
</a>

<style>
	.link-btn {
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

	.link-btn:active {
		transform: scale(0.98);
	}

	/* Sizes */
	.link-btn-sm {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
	}

	.link-btn-md {
		padding: var(--space-2) var(--space-4);
	}

	.link-btn-lg {
		padding: var(--space-3) var(--space-6);
		font-size: var(--text-base);
	}

	/* Variants */
	.link-btn-primary {
		background: var(--accent-primary);
		color: white;
		border-color: var(--accent-primary);
	}

	.link-btn-primary:hover {
		opacity: 0.9;
	}

	.link-btn-secondary {
		background: transparent;
		color: var(--text-primary);
		border-color: var(--border-default);
	}

	.link-btn-secondary:hover {
		background: var(--bg-secondary);
	}

	.link-btn-ghost {
		background: transparent;
		color: var(--text-primary);
		border-color: transparent;
	}

	.link-btn-ghost:hover {
		background: var(--bg-secondary);
	}

	.link-btn-danger {
		background: var(--status-error);
		color: white;
		border-color: var(--status-error);
	}

	.link-btn-danger:hover {
		opacity: 0.9;
	}
</style>
