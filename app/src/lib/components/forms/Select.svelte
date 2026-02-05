<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		name: string;
		disabled?: boolean;
		required?: boolean;
		children: Snippet;
	}

	let {
		value = $bindable(''),
		name,
		disabled = false,
		required = false,
		children
	}: Props = $props();
</script>

<select bind:value {name} id={name} {disabled} {required} class="select">
	{@render children()}
</select>

<style>
	.select {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-family: inherit;
		color: var(--text-primary);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
		appearance: none;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right var(--space-2) center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
		padding-right: var(--space-8);
	}

	.select:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: var(--focus-ring);
	}

	.select:disabled {
		background-color: var(--bg-secondary);
		color: var(--text-tertiary);
		cursor: not-allowed;
	}
</style>
