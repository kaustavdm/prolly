<script lang="ts">
	import { keyboardStore } from '$lib/stores/keyboard.svelte';
	import { commandRegistry, type Command } from '$lib/commands/registry';
	import { formatShortcut } from '$lib/commands/keyboard';

	let searchQuery = $state('');
	let selectedIndex = $state(0);
	let inputRef = $state<HTMLInputElement | null>(null);

	let filteredCommands = $derived(commandRegistry.search(searchQuery));

	$effect(() => {
		if (keyboardStore.commandPaletteOpen && inputRef) {
			searchQuery = '';
			selectedIndex = 0;
			setTimeout(() => inputRef?.focus(), 0);
		}
	});

	$effect(() => {
		searchQuery;
		selectedIndex = 0;
	});

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredCommands[selectedIndex]) {
					executeCommand(filteredCommands[selectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				keyboardStore.closeCommandPalette();
				break;
		}
	}

	function executeCommand(command: Command) {
		keyboardStore.closeCommandPalette();
		commandRegistry.execute(command.id);
	}

	function handleBackdropClick() {
		keyboardStore.closeCommandPalette();
	}
</script>

{#if keyboardStore.commandPaletteOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="command-palette-backdrop" onclick={handleBackdropClick} role="presentation">
		<div class="command-palette" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command palette">
			<div class="search-container">
				<input
					bind:this={inputRef}
					bind:value={searchQuery}
					onkeydown={handleKeydown}
					type="text"
					placeholder="Type a command..."
					class="search-input"
					aria-label="Search commands"
				/>
			</div>
			<div class="command-list" role="listbox">
				{#each filteredCommands as command, index}
					<button
						class="command-item"
						class:selected={index === selectedIndex}
						onclick={() => executeCommand(command)}
						role="option"
						aria-selected={index === selectedIndex}
					>
						<span class="command-label">{command.label}</span>
						{#if command.shortcut}
							<span class="command-shortcut">{formatShortcut(command.shortcut)}</span>
						{/if}
					</button>
				{:else}
					<div class="no-results">No commands found</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.command-palette-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 20vh;
		z-index: 1000;
	}

	.command-palette {
		width: 100%;
		max-width: 560px;
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-xl);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
	}

	.search-container {
		padding: var(--space-3);
		border-bottom: 1px solid var(--border-default);
	}

	.search-input {
		width: 100%;
		padding: var(--space-3);
		border: none;
		background: transparent;
		font-size: var(--text-lg);
		color: var(--text-primary);
	}

	.search-input:focus {
		outline: none;
	}

	.search-input::placeholder {
		color: var(--text-tertiary);
	}

	.command-list {
		max-height: 320px;
		overflow-y: auto;
		padding: var(--space-2);
	}

	.command-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-3) var(--space-4);
		border: none;
		background: transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		color: var(--text-primary);
	}

	.command-item:hover,
	.command-item.selected {
		background: var(--bg-secondary);
	}

	.command-label {
		font-size: var(--text-sm);
	}

	.command-shortcut {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.no-results {
		padding: var(--space-6);
		text-align: center;
		color: var(--text-tertiary);
	}
</style>
