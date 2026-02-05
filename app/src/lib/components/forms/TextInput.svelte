<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'class'> {
		value?: string;
		name: string;
		type?: 'text' | 'email' | 'password' | 'url' | 'search';
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable(''),
		name,
		type = 'text',
		placeholder = '',
		disabled = false,
		...rest
	}: Props = $props();
</script>

<input
	bind:value
	{name}
	id={name}
	{type}
	{placeholder}
	{disabled}
	class="text-input"
	{...rest}
/>

<style>
	.text-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-family: inherit;
		color: var(--text-primary);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.text-input::placeholder {
		color: var(--text-tertiary);
	}

	.text-input:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: var(--focus-ring);
	}

	.text-input:disabled {
		background: var(--bg-secondary);
		color: var(--text-tertiary);
		cursor: not-allowed;
	}
</style>
