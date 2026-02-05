<script lang="ts">
	interface Props {
		submitLabel?: string;
		cancelLabel?: string;
		submitting?: boolean;
		oncancel?: () => void;
	}

	let {
		submitLabel = 'Save',
		cancelLabel = 'Cancel',
		submitting = false,
		oncancel
	}: Props = $props();
</script>

<div class="form-actions">
	{#if oncancel}
		<button type="button" class="btn btn-secondary" onclick={oncancel} disabled={submitting}>
			{cancelLabel}
		</button>
	{/if}
	<button type="submit" class="btn btn-primary" disabled={submitting}>
		{#if submitting}
			<span class="spinner"></span>
		{/if}
		{submitLabel}
	</button>
</div>

<style>
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: 500;
		font-family: inherit;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
		border: 1px solid transparent;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

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
