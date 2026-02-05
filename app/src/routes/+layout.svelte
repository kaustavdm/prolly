<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initializeApp } from '$lib/stores/app.svelte';
	import { registerDefaultCommands } from '$lib/commands/defaults';
	import { keymap } from '$lib/actions/keymap';
	import { goto } from '$app/navigation';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import KeyboardModeIndicator from '$lib/components/KeyboardModeIndicator.svelte';
	import HelpOverlay from '$lib/components/HelpOverlay.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const globalKeymap = {
		g: {
			h: () => goto('/'),
			c: () => goto('/curricula'),
			o: () => goto('/objectives'),
			l: () => goto('/lessons'),
			p: () => goto('/projects'),
			j: () => goto('/journal'),
			r: () => goto('/progress'),
			s: () => goto('/settings')
		},
		n: {
			c: () => goto('/curricula/new'),
			o: () => goto('/objectives/new'),
			l: () => goto('/lessons/new'),
			p: () => goto('/projects/new'),
			n: () => goto('/journal/new?type=note')
		}
	};

	onMount(() => {
		registerDefaultCommands();
		initializeApp();
	});
</script>

<svelte:head>
	<title>Prolly</title>
</svelte:head>

<div class="app-layout" use:keymap={globalKeymap}>
	<Sidebar />
	<main class="main-content">
		{@render children()}
	</main>
	<CommandPalette />
	<KeyboardModeIndicator />
	<HelpOverlay />
</div>

<style>
	.app-layout {
		display: flex;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		padding: var(--space-6);
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.app-layout {
			flex-direction: column;
		}

		.main-content {
			padding: var(--space-4);
		}
	}
</style>
