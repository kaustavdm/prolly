<script lang="ts">
	import { page } from '$app/stores';

	interface NavItem {
		href: string;
		label: string;
		shortcut: string;
	}

	const navItems: NavItem[] = [
		{ href: '/', label: 'Dashboard', shortcut: 'g h' },
		{ href: '/curricula', label: 'Curricula', shortcut: 'g c' },
		{ href: '/objectives', label: 'Objectives', shortcut: 'g o' },
		{ href: '/lessons', label: 'Lessons', shortcut: 'g l' },
		{ href: '/projects', label: 'Projects', shortcut: 'g p' },
		{ href: '/journal', label: 'Journal', shortcut: 'g j' },
		{ href: '/progress', label: 'Progress', shortcut: 'g r' }
	];

	const bottomItems: NavItem[] = [
		{ href: '/settings', label: 'Settings', shortcut: 'g s' }
	];
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<a href="/" class="logo">Prolly</a>
	</div>

	<nav class="nav-main">
		{#each navItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={$page.url.pathname === item.href}
				aria-current={$page.url.pathname === item.href ? 'page' : undefined}
			>
				<span class="nav-label">{item.label}</span>
				<span class="nav-shortcut">{item.shortcut}</span>
			</a>
		{/each}
	</nav>

	<nav class="nav-bottom">
		{#each bottomItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={$page.url.pathname === item.href}
				aria-current={$page.url.pathname === item.href ? 'page' : undefined}
			>
				<span class="nav-label">{item.label}</span>
				<span class="nav-shortcut">{item.shortcut}</span>
			</a>
		{/each}
	</nav>
</aside>

<style>
	.sidebar {
		width: 240px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border-default);
		position: sticky;
		top: 0;
	}

	.sidebar-header {
		padding: var(--space-4) var(--space-4);
		border-bottom: 1px solid var(--border-default);
	}

	.logo {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		text-decoration: none;
	}

	.logo:hover {
		text-decoration: none;
	}

	.nav-main {
		flex: 1;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.nav-bottom {
		padding: var(--space-4);
		border-top: 1px solid var(--border-default);
	}

	.nav-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.nav-item:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		text-decoration: none;
	}

	.nav-item.active {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		font-weight: 500;
	}

	.nav-label {
		font-size: var(--text-sm);
	}

	.nav-shortcut {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		opacity: 0;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.nav-item:hover .nav-shortcut {
		opacity: 1;
	}

	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}
	}
</style>
