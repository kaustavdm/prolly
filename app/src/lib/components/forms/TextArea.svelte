<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'class'> {
		value?: string;
		name: string;
		placeholder?: string;
		disabled?: boolean;
		rows?: number;
	}

	let {
		value = $bindable(''),
		name,
		placeholder = '',
		disabled = false,
		rows = 4,
		...rest
	}: Props = $props();
</script>

<textarea
	bind:value
	{name}
	id={name}
	{placeholder}
	{disabled}
	{rows}
	class="textarea"
	{...rest}
></textarea>

<style>
	.textarea {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-family: inherit;
		color: var(--text-primary);
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		resize: vertical;
		min-height: 80px;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.textarea::placeholder {
		color: var(--text-tertiary);
	}

	.textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: var(--focus-ring);
	}

	.textarea:disabled {
		background: var(--bg-secondary);
		color: var(--text-tertiary);
		cursor: not-allowed;
	}
</style>
