<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { db } from '$lib/db';
	import { Button } from '$lib/components/ui';
	import type { ThemePreference } from '$lib/models';

	let userName = $state(appStore.user?.name || '');

	async function updateName() {
		if (!appStore.user || !userName.trim()) return;

		await db.users.update(appStore.user.id, {
			name: userName.trim(),
			updatedAt: new Date().toISOString()
		});

		appStore.setUser({ ...appStore.user, name: userName.trim() });
	}

	function handleThemeChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		appStore.setTheme(target.value as ThemePreference);
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>Settings</h1>
	</header>

	<section class="settings-section">
		<h2>Profile</h2>
		<div class="form-group">
			<label for="name">Display Name</label>
			<div class="input-group">
				<input type="text" id="name" bind:value={userName} />
				<Button variant="secondary" onclick={updateName}>Save</Button>
			</div>
		</div>
	</section>

	<section class="settings-section">
		<h2>Appearance</h2>
		<div class="form-group">
			<label for="theme">Theme</label>
			<select id="theme" value={appStore.theme} onchange={handleThemeChange}>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</div>
	</section>

	<section class="settings-section">
		<h2>Keyboard Shortcuts</h2>
		<p class="hint">Press <kbd>?</kbd> anywhere to see available keyboard shortcuts.</p>
	</section>

	<section class="settings-section">
		<h2>Data</h2>
		<p class="hint">Your data is stored locally on this device. No data is sent to any server.</p>
	</section>
</div>

<style>
	.page {
		max-width: 640px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.settings-section {
		margin-bottom: var(--space-8);
		padding-bottom: var(--space-8);
		border-bottom: 1px solid var(--border-default);
	}

	.settings-section:last-child {
		border-bottom: none;
	}

	.settings-section h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.form-group {
		margin-bottom: var(--space-4);
	}

	.form-group label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
	}

	.input-group {
		display: flex;
		gap: var(--space-2);
	}

	input,
	select {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: var(--text-sm);
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.hint {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.hint kbd {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}
</style>
