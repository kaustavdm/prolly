<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		name: string;
		error?: string | null;
		helpText?: string | null;
		required?: boolean;
		children: Snippet;
	}

	let { label, name, error = null, helpText = null, required = false, children }: Props = $props();
</script>

<div class="form-field" class:has-error={error}>
	<label for={name}>
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	{@render children()}
	{#if error}
		<p class="error-text">{error}</p>
	{:else if helpText}
		<p class="help-text">{helpText}</p>
	{/if}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
	}

	.required {
		color: var(--accent-error);
		margin-left: var(--space-1);
	}

	.error-text {
		font-size: var(--text-sm);
		color: var(--accent-error);
	}

	.help-text {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
	}

	.has-error :global(input),
	.has-error :global(textarea),
	.has-error :global(select) {
		border-color: var(--accent-error);
	}
</style>
