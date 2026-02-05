<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import Toast from './Toast.svelte';
</script>

{#if toastStore.toasts.length > 0}
	<div class="toast-container" aria-live="polite" aria-atomic="false">
		{#each toastStore.toasts as toast (toast.id)}
			<Toast
				id={toast.id}
				type={toast.type}
				message={toast.message}
				ondismiss={toastStore.dismiss.bind(toastStore)}
			/>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		top: var(--space-4);
		right: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		z-index: 1100;
		pointer-events: none;
	}

	.toast-container > :global(*) {
		pointer-events: auto;
	}
</style>
