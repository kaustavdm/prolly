<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { projectService } from '$lib/services/project';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { ProjectForm, MilestoneList } from '$lib/components/project';
	import { Button, ConfirmDialog, LoadingState, EmptyState } from '$lib/components/ui';
	import type { Project, Objective, Milestone } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	let project = $state<Project | null>(null);
	let linkedObjectives = $state<Objective[]>([]);
	let loading = $state(true);
	let isEditing = $state(false);
	let showDeleteDialog = $state(false);
	let submitting = $state(false);
	let deleting = $state(false);
	let errors = $state<ValidationErrors>({});

	const id = $derived($page.params.id);

	const statusLabels: Record<Project['status'], string> = {
		planning: 'Planning',
		active: 'Active',
		completed: 'Completed',
		archived: 'Archived'
	};

	$effect(() => {
		if (!id) return;

		loading = true;

		const projectSub = liveQuery(() => db.projects.get(id)).subscribe({
			next: (value) => {
				if (value && !value.deletedAt) {
					project = value;
					// Fetch linked objectives
					if (value.objectiveIds.length > 0) {
						db.objectives.bulkGet(value.objectiveIds).then((objs) => {
							linkedObjectives = objs.filter(
								(o): o is Objective => o !== undefined && !o.deletedAt
							);
						});
					} else {
						linkedObjectives = [];
					}
				} else {
					project = null;
				}
				loading = false;
			},
			error: (err) => {
				console.error(err);
				loading = false;
			}
		});

		return () => {
			projectSub.unsubscribe();
		};
	});

	async function handleSave(data: {
		name: string;
		description: string;
		status: Project['status'];
		objectiveIds: string[];
	}) {
		if (!project) return;

		submitting = true;
		errors = {};

		const result = await projectService.update(project.id, {
			name: data.name,
			description: data.description || undefined,
			status: data.status,
			objectiveIds: data.objectiveIds
		});

		submitting = false;

		if (result.success) {
			toastStore.success('Project updated');
			isEditing = false;
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else {
				toastStore.error(result.error?.message || 'Failed to update project');
			}
		}
	}

	async function handleDelete() {
		if (!project) return;

		deleting = true;

		const result = await projectService.delete(project.id);

		deleting = false;
		showDeleteDialog = false;

		if (result.success) {
			toastStore.success('Project deleted');
			goto('/projects');
		} else {
			toastStore.error(result.error?.message || 'Failed to delete project');
		}
	}

	async function handleAddMilestone(milestone: Omit<Milestone, 'id'>) {
		if (!project) return;

		const result = await projectService.addMilestone(project.id, milestone);
		if (result.success) {
			toastStore.success('Milestone added');
		} else {
			toastStore.error(result.error?.message || 'Failed to add milestone');
		}
	}

	async function handleCompleteMilestone(milestoneId: string) {
		if (!project) return;

		const result = await projectService.completeMilestone(project.id, milestoneId);
		if (result.success) {
			toastStore.success('Milestone completed');
		} else {
			toastStore.error(result.error?.message || 'Failed to complete milestone');
		}
	}

	async function handleRemoveMilestone(milestoneId: string) {
		if (!project) return;

		const result = await projectService.removeMilestone(project.id, milestoneId);
		if (result.success) {
			toastStore.success('Milestone removed');
		} else {
			toastStore.error(result.error?.message || 'Failed to remove milestone');
		}
	}

	function handleCancelEdit() {
		isEditing = false;
		errors = {};
	}
</script>

<div class="page">
	{#if loading}
		<LoadingState message="Loading project..." />
	{:else if !project}
		<EmptyState
			title="Project not found"
			description="This project may have been deleted."
			actionHref="/projects"
			actionLabel="Back to Projects"
		/>
	{:else}
		<header class="page-header">
			<nav class="breadcrumb">
				<a href="/projects">Projects</a>
				<span>/</span>
				<span>{project.name}</span>
			</nav>
			<div class="header-row">
				<div class="title-row">
					<h1>{project.name}</h1>
					<span class="status-badge status-{project.status}">
						{statusLabels[project.status]}
					</span>
				</div>
				<div class="actions">
					{#if !isEditing}
						<Button variant="secondary" onclick={() => (isEditing = true)}>Edit</Button>
						<Button variant="danger" onclick={() => (showDeleteDialog = true)}>Delete</Button>
					{/if}
				</div>
			</div>
		</header>

		{#if isEditing}
			<ProjectForm
				{project}
				{errors}
				{submitting}
				onsubmit={handleSave}
				oncancel={handleCancelEdit}
			/>
		{:else}
			<div class="content">
				{#if project.description}
					<p class="description">{project.description}</p>
				{/if}

				<section class="milestones-section">
					<h2>Milestones</h2>
					<MilestoneList
						milestones={project.milestones}
						onAdd={handleAddMilestone}
						onComplete={handleCompleteMilestone}
						onRemove={handleRemoveMilestone}
					/>
				</section>

				{#if linkedObjectives.length > 0}
					<section class="objectives-section">
						<h2>Linked Objectives</h2>
						<ul class="objectives-list">
							{#each linkedObjectives as objective}
								<li>
									<a href="/objectives/{objective.id}" class="objective-link">
										{objective.name}
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<ConfirmDialog
	open={showDeleteDialog}
	title="Delete Project"
	message="Are you sure you want to delete this project? All milestones will also be deleted. This action cannot be undone."
	confirmLabel="Delete"
	loading={deleting}
	onconfirm={handleDelete}
	oncancel={() => (showDeleteDialog = false)}
/>

<style>
	.page {
		max-width: 960px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-6);
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin-bottom: var(--space-2);
	}

	.breadcrumb a {
		color: var(--text-secondary);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--accent-primary);
	}

	.header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.status-badge {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.status-planning {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
	}

	.status-active {
		background: color-mix(in srgb, var(--color-success) 15%, transparent);
		color: var(--color-success);
	}

	.status-completed {
		background: var(--accent-primary-alpha);
		color: var(--accent-primary);
	}

	.status-archived {
		background: var(--bg-tertiary);
		color: var(--text-tertiary);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	.description {
		color: var(--text-secondary);
		margin-bottom: var(--space-6);
		line-height: 1.6;
	}

	.milestones-section,
	.objectives-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border-default);
	}

	.milestones-section h2,
	.objectives-section h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.objectives-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.objective-link {
		display: block;
		padding: var(--space-3) var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--text-primary);
		font-size: var(--text-sm);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.objective-link:hover {
		border-color: var(--accent-primary);
	}
</style>
