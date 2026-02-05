<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import { LinkButton } from '$lib/components/ui';
	import type { Activity, Project, Curriculum, Progress } from '$lib/models';

	let recentActivities = $state<Activity[]>([]);
	let activeProjects = $state<Project[]>([]);
	let recentCurricula = $state<Curriculum[]>([]);
	let progressStats = $state({ inProgress: 0, achieved: 0 });

	$effect(() => {
		if (!appStore.personalSpace) return;

		const activitySub = liveQuery(() =>
			db.activities
				.where('[spaceId+createdAt]')
				.between([appStore.personalSpace!.id, ''], [appStore.personalSpace!.id, '\uffff'])
				.reverse()
				.limit(5)
				.toArray()
		).subscribe({
			next: (value) => (recentActivities = value),
			error: console.error
		});

		const projectSub = liveQuery(() =>
			db.projects
				.where('spaceId')
				.equals(appStore.personalSpace!.id)
				.and((p) => !p.deletedAt && (p.status === 'active' || p.status === 'planning'))
				.limit(5)
				.toArray()
		).subscribe({
			next: (value) => (activeProjects = value),
			error: console.error
		});

		const curriculaSub = liveQuery(() =>
			db.curricula
				.where('spaceId')
				.equals(appStore.personalSpace!.id)
				.and((c) => !c.deletedAt)
				.reverse()
				.limit(3)
				.toArray()
		).subscribe({
			next: (value) => (recentCurricula = value),
			error: console.error
		});

		const progressSub = liveQuery(() =>
			db.progress
				.where('userId')
				.equals(appStore.user!.id)
				.and((p) => !p.deletedAt)
				.toArray()
		).subscribe({
			next: (value) => {
				progressStats = {
					inProgress: value.filter((p) => p.status === 'in_progress').length,
					achieved: value.filter((p) => p.status === 'achieved').length
				};
			},
			error: console.error
		});

		return () => {
			activitySub.unsubscribe();
			projectSub.unsubscribe();
			curriculaSub.unsubscribe();
			progressSub.unsubscribe();
		};
	});

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatActivityType(type: string): string {
		return type
			.split('.')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	const statusLabels: Record<string, string> = {
		planning: 'Planning',
		active: 'Active'
	};
</script>

<div class="dashboard">
	<header class="dashboard-header">
		<h1>Dashboard</h1>
		<p class="subtitle">Welcome back{appStore.user ? `, ${appStore.user.name}` : ''}</p>
	</header>

	<section class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{progressStats.inProgress}</span>
			<span class="stat-label">In Progress</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{progressStats.achieved}</span>
			<span class="stat-label">Achieved</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{activeProjects.length}</span>
			<span class="stat-label">Active Projects</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{recentCurricula.length}</span>
			<span class="stat-label">Curricula</span>
		</div>
	</section>

	<section class="quick-actions">
		<h2>Quick Actions</h2>
		<div class="actions-grid">
			<LinkButton href="/curricula/new" variant="secondary">New Curriculum</LinkButton>
			<LinkButton href="/objectives/new" variant="secondary">New Objective</LinkButton>
			<LinkButton href="/projects/new" variant="secondary">New Project</LinkButton>
			<LinkButton href="/journal/new" variant="secondary">New Journal Entry</LinkButton>
		</div>
		<p class="hint">Press <kbd>?</kbd> to see keyboard shortcuts or <kbd>⌘K</kbd> to open command palette</p>
	</section>

	<div class="two-column">
		<section class="recent-activity">
			<h2>Recent Activity</h2>
			{#if recentActivities.length === 0}
				<p class="empty-state">No recent activity yet. Start by creating a curriculum or project.</p>
			{:else}
				<ul class="activity-list">
					{#each recentActivities as activity}
						<li class="activity-item">
							<span class="activity-type">{formatActivityType(activity.type)}</span>
							<time class="activity-time">{formatDate(activity.createdAt)}</time>
						</li>
					{/each}
				</ul>
				<LinkButton href="/journal" variant="ghost" size="sm">View all activity →</LinkButton>
			{/if}
		</section>

		<section class="active-projects">
			<h2>Active Projects</h2>
			{#if activeProjects.length === 0}
				<p class="empty-state">No active projects. Create your first project to get started.</p>
			{:else}
				<ul class="project-list">
					{#each activeProjects as project}
						<li>
							<a href="/projects/{project.id}" class="project-item">
								<span class="project-name">{project.name}</span>
								<span class="project-status status-{project.status}">{statusLabels[project.status]}</span>
							</a>
						</li>
					{/each}
				</ul>
				<LinkButton href="/projects" variant="ghost" size="sm">View all projects →</LinkButton>
			{/if}
		</section>
	</div>

	{#if recentCurricula.length > 0}
		<section class="recent-curricula">
			<h2>Recent Curricula</h2>
			<ul class="curricula-list">
				{#each recentCurricula as curriculum}
					<li>
						<a href="/curricula/{curriculum.id}" class="curriculum-item">
							<span class="curriculum-name">{curriculum.name}</span>
							{#if curriculum.description}
								<span class="curriculum-desc">{curriculum.description}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
			<LinkButton href="/curricula" variant="ghost" size="sm">View all curricula →</LinkButton>
		</section>
	{/if}
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stat-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: var(--text-3xl);
		font-weight: 600;
		color: var(--accent-primary);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
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

	.actions-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
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

	.two-column {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	.empty-state {
		color: var(--text-tertiary);
		padding: var(--space-6);
		text-align: center;
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--border-default);
		font-size: var(--text-sm);
	}

	.activity-list,
	.project-list,
	.curricula-list {
		list-style: none;
		padding: 0;
		margin-bottom: var(--space-3);
	}

	.activity-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
	}

	.activity-type {
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.activity-time {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
	}

	.project-item,
	.curriculum-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.project-item:hover,
	.curriculum-item:hover {
		border-color: var(--accent-primary);
	}

	.project-name,
	.curriculum-name {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
	}

	.curriculum-item {
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
	}

	.curriculum-desc {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.project-status {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.status-planning {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.status-active {
		background: hsl(210, 80%, 90%);
		color: hsl(210, 80%, 35%);
	}
</style>
