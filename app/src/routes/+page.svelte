<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
</script>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>Dashboard</h1>
		<p class="subtitle">Welcome back{appStore.user ? `, ${appStore.user.name}` : ''}</p>
	</header>

	<section class="quick-actions">
		<h2>Quick Actions</h2>
		<p class="hint">Press <kbd>?</kbd> to see keyboard shortcuts or <kbd>⌘K</kbd> to open command palette</p>
	</section>

	<section class="recent-activity">
		<h2>Recent Activity</h2>
		<p class="empty-state">No recent activity yet. Start by creating a curriculum or project.</p>
	</section>

	<section class="active-projects">
		<h2>Active Projects</h2>
		<p class="empty-state">No active projects. Create your first project to get started.</p>
	</section>
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
	}

	.dashboard-header {
		margin-bottom: var(--space-8);
	}

	.dashboard-header h1 {
		font-size: var(--text-3xl);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: var(--text-lg);
	}

	section {
		margin-bottom: var(--space-8);
	}

	section h2 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-4);
		color: var(--text-primary);
	}

	.hint {
		color: var(--text-secondary);
		font-size: var(--text-sm);
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

	.empty-state {
		color: var(--text-tertiary);
		padding: var(--space-8);
		text-align: center;
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--border-default);
	}
</style>
