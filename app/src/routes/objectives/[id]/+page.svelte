<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { objectiveService, progressService } from '$lib/services';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import { ObjectiveForm } from '$lib/components/objective';
	import { Button, ConfirmDialog, LoadingState, EmptyState } from '$lib/components/ui';
	import type { Objective, Curriculum, Progress } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	let objective = $state<Objective | null>(null);
	let curriculum = $state<Curriculum | null>(null);
	let prerequisiteObjectives = $state<Objective[]>([]);
	let progress = $state<Progress | null>(null);
	let canStart = $state(true);
	let loading = $state(true);
	let isEditing = $state(false);
	let showDeleteDialog = $state(false);
	let submitting = $state(false);
	let deleting = $state(false);
	let progressUpdating = $state(false);
	let errors = $state<ValidationErrors>({});

	const id = $derived($page.params.id);

	$effect(() => {
		if (!id) return;

		loading = true;

		const objSub = liveQuery(() => db.objectives.get(id)).subscribe({
			next: (value) => {
				if (value && !value.deletedAt) {
					objective = value;
					// Fetch curriculum
					db.curricula.get(value.curriculumId).then((c) => {
						curriculum = c && !c.deletedAt ? c : null;
					});
					// Fetch prerequisite names
					if (value.prerequisites.length > 0) {
						db.objectives.bulkGet(value.prerequisites).then((prereqs) => {
							prerequisiteObjectives = prereqs.filter(
								(p): p is Objective => p !== undefined && !p.deletedAt
							);
						});
					} else {
						prerequisiteObjectives = [];
					}
					// Fetch progress if user is logged in
					if (appStore.user && appStore.personalSpace) {
						fetchProgress(value.id);
					}
				} else {
					objective = null;
				}
				loading = false;
			},
			error: (err) => {
				console.error(err);
				loading = false;
			}
		});

		return () => {
			objSub.unsubscribe();
		};
	});

	async function fetchProgress(objectiveId: string) {
		if (!appStore.user || !appStore.personalSpace) return;

		const result = await progressService.get(appStore.user.id, objectiveId);
		if (result.success && result.data) {
			progress = result.data;
		} else {
			progress = null;
		}

		// Check if user can start this objective (prerequisites achieved)
		const canStartResult = await progressService.canStartObjective(
			appStore.user.id,
			objectiveId,
			appStore.personalSpace.id
		);
		canStart = canStartResult;
	}

	async function handleSave(data: {
		name: string;
		description: string;
		curriculumId: string;
		prerequisites: string[];
	}) {
		if (!objective) return;

		submitting = true;
		errors = {};

		// First update basic info
		const updateResult = await objectiveService.update(objective.id, {
			name: data.name,
			description: data.description || undefined
		});

		if (!updateResult.success) {
			submitting = false;
			if (updateResult.error?.code === 'VALIDATION_ERROR' && updateResult.error.field) {
				errors = { [updateResult.error.field]: updateResult.error.message };
			} else {
				toastStore.error(updateResult.error?.message || 'Failed to update objective');
			}
			return;
		}

		// Update prerequisites if changed
		const prereqsChanged =
			data.prerequisites.length !== objective.prerequisites.length ||
			!data.prerequisites.every((p) => objective!.prerequisites.includes(p));

		if (prereqsChanged) {
			const prereqResult = await objectiveService.updatePrerequisites(
				objective.id,
				data.prerequisites
			);

			if (!prereqResult.success) {
				submitting = false;
				if (prereqResult.error?.code === 'DAG_CYCLE') {
					errors = { prerequisites: prereqResult.error.message };
				} else {
					toastStore.error(prereqResult.error?.message || 'Failed to update prerequisites');
				}
				return;
			}
		}

		submitting = false;
		toastStore.success('Objective updated');
		isEditing = false;
	}

	async function handleDelete() {
		if (!objective) return;

		deleting = true;

		const result = await objectiveService.delete(objective.id);

		deleting = false;
		showDeleteDialog = false;

		if (result.success) {
			toastStore.success('Objective deleted');
			if (curriculum) {
				goto(`/curricula/${curriculum.id}`);
			} else {
				goto('/objectives');
			}
		} else {
			toastStore.error(result.error?.message || 'Failed to delete objective');
		}
	}

	function handleCancelEdit() {
		isEditing = false;
		errors = {};
	}

	async function handleStartObjective() {
		if (!objective || !appStore.user || !appStore.personalSpace) return;

		progressUpdating = true;
		const result = await progressService.start(
			appStore.user.id,
			objective.id,
			appStore.personalSpace.id
		);

		if (result.success && result.data) {
			progress = result.data;
			toastStore.success('Started working on objective');
		} else {
			toastStore.error(result.error?.message ?? 'Failed to start objective');
		}
		progressUpdating = false;
	}

	async function handleAchieveObjective() {
		if (!objective || !appStore.user || !appStore.personalSpace) return;

		progressUpdating = true;
		const result = await progressService.achieve(
			appStore.user.id,
			objective.id,
			appStore.personalSpace.id
		);

		if (result.success && result.data) {
			progress = result.data;
			toastStore.success('Objective achieved! 🎉');
		} else {
			toastStore.error(result.error?.message ?? 'Failed to mark objective as achieved');
		}
		progressUpdating = false;
	}

	async function handleResetProgress() {
		if (!objective || !appStore.user || !appStore.personalSpace) return;

		progressUpdating = true;
		const result = await progressService.reset(
			appStore.user.id,
			objective.id,
			appStore.personalSpace.id
		);

		if (result.success && result.data) {
			progress = result.data;
			toastStore.success('Progress reset');
		} else {
			toastStore.error(result.error?.message ?? 'Failed to reset progress');
		}
		progressUpdating = false;
	}

	function getProgressStatusLabel(status: Progress['status']): string {
		switch (status) {
			case 'not_started':
				return 'Not Started';
			case 'in_progress':
				return 'In Progress';
			case 'achieved':
				return 'Achieved';
			default:
				return status;
		}
	}
</script>

<div class="page">
	{#if loading}
		<LoadingState message="Loading objective..." />
	{:else if !objective}
		<EmptyState
			title="Objective not found"
			description="This objective may have been deleted."
			actionHref="/objectives"
			actionLabel="Back to Objectives"
		/>
	{:else}
		<header class="page-header">
			<nav class="breadcrumb">
				<a href="/objectives">Objectives</a>
				<span>/</span>
				<span>{objective.name}</span>
			</nav>
			<div class="header-row">
				<h1>{objective.name}</h1>
				<div class="actions">
					{#if !isEditing}
						<Button variant="secondary" onclick={() => (isEditing = true)}>Edit</Button>
						<Button variant="danger" onclick={() => (showDeleteDialog = true)}>Delete</Button>
					{/if}
				</div>
			</div>
		</header>

		{#if isEditing}
			<ObjectiveForm
				{objective}
				{errors}
				{submitting}
				onsubmit={handleSave}
				oncancel={handleCancelEdit}
			/>
		{:else}
			<div class="content">
				{#if curriculum}
					<div class="meta-info">
						<a href="/curricula/{curriculum.id}" class="curriculum-link">{curriculum.name}</a>
					</div>
				{/if}

				{#if objective.description}
					<p class="description">{objective.description}</p>
				{/if}

				<!-- Progress tracking section -->
				<section class="progress-section">
					<h2>Your Progress</h2>
					<div class="progress-card">
						{#if progress}
							<div class="progress-status status-{progress.status}">
								{getProgressStatusLabel(progress.status)}
							</div>
							{#if progress.status === 'achieved' && progress.achievedAt}
								<p class="achieved-date">
									Achieved on {new Date(progress.achievedAt).toLocaleDateString()}
								</p>
							{/if}
						{:else}
							<div class="progress-status status-not_started">Not Started</div>
						{/if}

						<div class="progress-actions">
							{#if !progress || progress.status === 'not_started'}
								{#if !canStart}
									<p class="prereq-notice">Complete prerequisites first to start this objective.</p>
								{:else}
									<Button
										variant="primary"
										onclick={handleStartObjective}
										disabled={progressUpdating}
									>
										{progressUpdating ? 'Starting...' : 'Start Objective'}
									</Button>
								{/if}
							{:else if progress.status === 'in_progress'}
								<Button
									variant="primary"
									onclick={handleAchieveObjective}
									disabled={progressUpdating}
								>
									{progressUpdating ? 'Updating...' : 'Mark as Achieved'}
								</Button>
								<Button
									variant="secondary"
									onclick={handleResetProgress}
									disabled={progressUpdating}
								>
									Reset
								</Button>
							{:else if progress.status === 'achieved'}
								<Button
									variant="secondary"
									onclick={handleResetProgress}
									disabled={progressUpdating}
								>
									Reset Progress
								</Button>
							{/if}
						</div>
					</div>
				</section>

				{#if prerequisiteObjectives.length > 0}
					<section class="prerequisites-section">
						<h2>Prerequisites</h2>
						<ul class="prerequisites-list">
							{#each prerequisiteObjectives as prereq}
								<li>
									<a href="/objectives/{prereq.id}" class="prereq-link">
										{prereq.name}
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
	title="Delete Objective"
	message="Are you sure you want to delete this objective? This will also remove it from any objectives that have it as a prerequisite. This action cannot be undone."
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
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	.meta-info {
		margin-bottom: var(--space-4);
	}

	.curriculum-link {
		display: inline-block;
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		text-decoration: none;
	}

	.curriculum-link:hover {
		background: var(--bg-secondary);
		color: var(--accent-primary);
	}

	.description {
		color: var(--text-secondary);
		margin-bottom: var(--space-6);
		line-height: 1.6;
	}

	.prerequisites-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border-default);
	}

	.prerequisites-section h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.prerequisites-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.prereq-link {
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

	.prereq-link:hover {
		border-color: var(--accent-primary);
	}

	.progress-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border-default);
	}

	.progress-section h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.progress-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.progress-status {
		display: inline-block;
		font-size: var(--text-sm);
		font-weight: 500;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-3);
	}

	.status-not_started {
		background: var(--bg-tertiary);
		color: var(--text-secondary);
	}

	.status-in_progress {
		background: hsl(210, 80%, 90%);
		color: hsl(210, 80%, 35%);
	}

	.status-achieved {
		background: hsl(142, 70%, 90%);
		color: hsl(142, 70%, 30%);
	}

	.achieved-date {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		margin-bottom: var(--space-3);
	}

	.progress-actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.prereq-notice {
		font-size: var(--text-sm);
		color: var(--text-tertiary);
		font-style: italic;
	}
</style>
