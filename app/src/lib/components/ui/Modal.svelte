<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	}

	let { open, title, onclose, children }: Props = $props();

	function handleBackdropClick() {
		onclose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
		<div
			class="modal"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-label={title}
			tabindex="-1"
		>
			<header class="modal-header">
				<h2>{title}</h2>
				<button class="close-button" onclick={onclose} aria-label="Close">
					×
				</button>
			</header>
			<div class="modal-content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn var(--duration-fast) var(--ease-out);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal {
		width: 100%;
		max-width: 480px;
		max-height: 90vh;
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-xl);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		animation: scaleIn var(--duration-normal) var(--ease-out);
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--border-default);
	}

	.modal-header h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.close-button {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		font-size: var(--text-2xl);
		color: var(--text-secondary);
		cursor: pointer;
		border-radius: var(--radius-md);
	}

	.close-button:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.modal-content {
		padding: var(--space-6);
		overflow-y: auto;
	}
</style>
