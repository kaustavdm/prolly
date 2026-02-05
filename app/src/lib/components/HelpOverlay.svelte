<script lang="ts">
	import { keyboardStore } from '$lib/stores/keyboard.svelte';
	import { commandRegistry } from '$lib/commands/registry';
	import { formatShortcut } from '$lib/commands/keyboard';

	let categorizedCommands = $derived(commandRegistry.getByCategory());

	function handleBackdropClick() {
		keyboardStore.closeHelp();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			keyboardStore.closeHelp();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if keyboardStore.helpOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="help-backdrop" onclick={handleBackdropClick} role="presentation">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
		<div class="help-overlay" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" aria-modal="true" aria-label="Keyboard shortcuts">
			<header class="help-header">
				<h2>Keyboard Shortcuts</h2>
				<button class="close-button" onclick={() => keyboardStore.closeHelp()} aria-label="Close">
					×
				</button>
			</header>

			<div class="help-content">
				<div class="help-intro">
					<p>Prolly uses vim-like modal keys. Press a prefix key to enter a mode, then press the action key.</p>
					<p>Press <kbd>Esc</kbd> to cancel any mode.</p>
				</div>

				<div class="shortcuts-grid">
					{#each [...categorizedCommands.entries()] as [category, commands]}
						<section class="shortcut-category">
							<h3>{category}</h3>
							<ul>
								{#each commands as command}
									{#if command.shortcut}
										<li>
											<span class="shortcut-label">{command.label}</span>
											<kbd class="shortcut-key">{formatShortcut(command.shortcut)}</kbd>
										</li>
									{/if}
								{/each}
							</ul>
						</section>
					{/each}
				</div>

				<div class="mode-reference">
					<h3>Mode Prefixes</h3>
					<ul>
						<li><kbd>n</kbd> New / Create</li>
						<li><kbd>g</kbd> Go / Navigate</li>
						<li><kbd>e</kbd> Edit</li>
						<li><kbd>d</kbd> Delete</li>
						<li><kbd>m</kbd> Mark / Toggle</li>
						<li><kbd>v</kbd> View</li>
						<li><kbd>/</kbd> Search</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.help-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.help-overlay {
		width: 100%;
		max-width: 720px;
		max-height: 80vh;
		background: var(--bg-primary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-xl);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.help-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--border-default);
	}

	.help-header h2 {
		font-size: var(--text-xl);
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

	.help-content {
		padding: var(--space-6);
		overflow-y: auto;
	}

	.help-intro {
		margin-bottom: var(--space-6);
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.help-intro p {
		margin-bottom: var(--space-2);
	}

	.help-intro kbd {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.shortcuts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-6);
		margin-bottom: var(--space-6);
	}

	.shortcut-category h3 {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-3);
	}

	.shortcut-category ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.shortcut-category li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--border-default);
	}

	.shortcut-category li:last-child {
		border-bottom: none;
	}

	.shortcut-label {
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.shortcut-key {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.mode-reference {
		padding: var(--space-4);
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
	}

	.mode-reference h3 {
		font-size: var(--text-sm);
		font-weight: 600;
		margin-bottom: var(--space-3);
	}

	.mode-reference ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: var(--space-2);
	}

	.mode-reference li {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.mode-reference kbd {
		display: inline-block;
		width: 24px;
		text-align: center;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		background: var(--bg-tertiary);
		padding: var(--space-1);
		border-radius: var(--radius-sm);
		margin-right: var(--space-2);
	}
</style>
