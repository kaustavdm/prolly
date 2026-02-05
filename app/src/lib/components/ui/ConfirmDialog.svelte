<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		title?: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'primary';
		loading?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	}

	let {
		open,
		title = 'Confirm',
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'danger',
		loading = false,
		onconfirm,
		oncancel
	}: Props = $props();
</script>

<Modal {open} {title} onclose={oncancel}>
	<div class="confirm-dialog">
		<p class="message">{message}</p>
		<div class="actions">
			<Button variant="secondary" onclick={oncancel} disabled={loading}>
				{cancelLabel}
			</Button>
			<Button {variant} onclick={onconfirm} {loading}>
				{confirmLabel}
			</Button>
		</div>
	</div>
</Modal>

<style>
	.confirm-dialog {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.message {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		line-height: 1.6;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}
</style>
