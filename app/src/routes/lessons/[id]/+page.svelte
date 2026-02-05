<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { lessonService } from '$lib/services/lesson';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { LessonForm } from '$lib/components/lesson';
	import { Button, ConfirmDialog, LoadingState, EmptyState } from '$lib/components/ui';
	import type { Lesson, Curriculum, Objective } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	let lesson = $state<Lesson | null>(null);
	let curriculum = $state<Curriculum | null>(null);
	let linkedObjectives = $state<Objective[]>([]);
	let loading = $state(true);
	let isEditing = $state(false);
	let showDeleteDialog = $state(false);
	let submitting = $state(false);
	let deleting = $state(false);
	let errors = $state<ValidationErrors>({});

	const id = $derived($page.params.id);

	$effect(() => {
		if (!id) return;

		loading = true;

		const lessonSub = liveQuery(() => db.lessons.get(id)).subscribe({
			next: (value) => {
				if (value && !value.deletedAt) {
					lesson = value;
					// Fetch curriculum if linked
					if (value.curriculumId) {
						db.curricula.get(value.curriculumId).then((c) => {
							curriculum = c && !c.deletedAt ? c : null;
						});
					} else {
						curriculum = null;
					}
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
					lesson = null;
				}
				loading = false;
			},
			error: (err) => {
				console.error(err);
				loading = false;
			}
		});

		return () => {
			lessonSub.unsubscribe();
		};
	});

	async function handleSave(data: {
		name: string;
		description: string;
		content: string;
		curriculumId: string;
		objectiveIds: string[];
	}) {
		if (!lesson) return;

		submitting = true;
		errors = {};

		const result = await lessonService.update(lesson.id, {
			name: data.name,
			description: data.description || undefined,
			content: data.content || undefined,
			curriculumId: data.curriculumId || undefined,
			objectiveIds: data.objectiveIds
		});

		submitting = false;

		if (result.success) {
			toastStore.success('Lesson updated');
			isEditing = false;
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else {
				toastStore.error(result.error?.message || 'Failed to update lesson');
			}
		}
	}

	async function handleDelete() {
		if (!lesson) return;

		deleting = true;

		const result = await lessonService.delete(lesson.id);

		deleting = false;
		showDeleteDialog = false;

		if (result.success) {
			toastStore.success('Lesson deleted');
			goto('/lessons');
		} else {
			toastStore.error(result.error?.message || 'Failed to delete lesson');
		}
	}

	function handleCancelEdit() {
		isEditing = false;
		errors = {};
	}
</script>

<div class="page">
	{#if loading}
		<LoadingState message="Loading lesson..." />
	{:else if !lesson}
		<EmptyState
			title="Lesson not found"
			description="This lesson may have been deleted."
			actionHref="/lessons"
			actionLabel="Back to Lessons"
		/>
	{:else}
		<header class="page-header">
			<nav class="breadcrumb">
				<a href="/lessons">Lessons</a>
				<span>/</span>
				<span>{lesson.name}</span>
			</nav>
			<div class="header-row">
				<h1>{lesson.name}</h1>
				<div class="actions">
					{#if !isEditing}
						<Button variant="secondary" onclick={() => (isEditing = true)}>Edit</Button>
						<Button variant="danger" onclick={() => (showDeleteDialog = true)}>Delete</Button>
					{/if}
				</div>
			</div>
		</header>

		{#if isEditing}
			<LessonForm
				{lesson}
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

				{#if lesson.description}
					<p class="description">{lesson.description}</p>
				{/if}

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

				{#if lesson.content}
					<section class="content-section">
						<h2>Content</h2>
						<div class="lesson-content">
							{lesson.content}
						</div>
					</section>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<ConfirmDialog
	open={showDeleteDialog}
	title="Delete Lesson"
	message="Are you sure you want to delete this lesson? This action cannot be undone."
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

	.objectives-section,
	.content-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border-default);
	}

	.objectives-section h2,
	.content-section h2 {
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

	.lesson-content {
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.7;
		white-space: pre-wrap;
	}
</style>
