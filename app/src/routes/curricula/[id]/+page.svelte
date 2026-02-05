<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { curriculumService } from '$lib/services';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { CurriculumForm } from '$lib/components/curriculum';
	import { Button, ConfirmDialog, LoadingState, EmptyState, LinkButton } from '$lib/components/ui';
	import type { Curriculum, Objective } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	let curriculum = $state<Curriculum | null>(null);
	let objectives = $state<Objective[]>([]);
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

		const currSub = liveQuery(() => db.curricula.get(id)).subscribe({
			next: (value) => {
				if (value && !value.deletedAt) {
					curriculum = value;
				} else {
					curriculum = null;
				}
				loading = false;
			},
			error: (err) => {
				console.error(err);
				loading = false;
			}
		});

		const objSub = liveQuery(() =>
			db.objectives
				.where('curriculumId')
				.equals(id)
				.and((o) => !o.deletedAt)
				.toArray()
		).subscribe({
			next: (value) => (objectives = value),
			error: console.error
		});

		return () => {
			currSub.unsubscribe();
			objSub.unsubscribe();
		};
	});

	async function handleSave(data: { name: string; description: string }) {
		if (!curriculum) return;

		submitting = true;
		errors = {};

		const result = await curriculumService.update(curriculum.id, {
			name: data.name,
			description: data.description || undefined
		});

		submitting = false;

		if (result.success) {
			toastStore.success('Curriculum updated');
			isEditing = false;
		} else {
			if (result.error?.code === 'VALIDATION_ERROR') {
				errors = { name: result.error.message };
			} else {
				toastStore.error(result.error?.message || 'Failed to update curriculum');
			}
		}
	}

	async function handleDelete() {
		if (!curriculum) return;

		deleting = true;

		const result = await curriculumService.deleteWithCascade(curriculum.id);

		deleting = false;
		showDeleteDialog = false;

		if (result.success) {
			toastStore.success('Curriculum deleted');
			goto('/curricula');
		} else {
			toastStore.error(result.error?.message || 'Failed to delete curriculum');
		}
	}

	function handleCancelEdit() {
		isEditing = false;
		errors = {};
	}
</script>

<div class="page">
	{#if loading}
		<LoadingState message="Loading curriculum..." />
	{:else if !curriculum}
		<EmptyState
			title="Curriculum not found"
			description="This curriculum may have been deleted."
			actionHref="/curricula"
			actionLabel="Back to Curricula"
		/>
	{:else}
		<header class="page-header">
			<nav class="breadcrumb">
				<a href="/curricula">Curricula</a>
				<span>/</span>
				<span>{curriculum.name}</span>
			</nav>
			<div class="header-row">
				<h1>{curriculum.name}</h1>
				<div class="actions">
					{#if !isEditing}
						<Button variant="secondary" onclick={() => (isEditing = true)}>Edit</Button>
						<Button variant="danger" onclick={() => (showDeleteDialog = true)}>Delete</Button>
					{/if}
				</div>
			</div>
		</header>

		{#if isEditing}
			<CurriculumForm
				{curriculum}
				{errors}
				{submitting}
				onsubmit={handleSave}
				oncancel={handleCancelEdit}
			/>
		{:else}
			<div class="content">
				{#if curriculum.description}
					<p class="description">{curriculum.description}</p>
				{/if}

				<section class="objectives-section">
					<div class="section-header">
						<h2>Objectives</h2>
						<LinkButton href="/objectives/new?curriculumId={curriculum.id}" size="sm">
							Add Objective
						</LinkButton>
					</div>

					{#if objectives.length === 0}
						<div class="empty-objectives">
							<p>No objectives yet. Add objectives to define learning goals.</p>
						</div>
					{:else}
						<ul class="objectives-list">
							{#each objectives as objective}
								<li>
									<a href="/objectives/{objective.id}" class="objective-item">
										<span class="objective-name">{objective.name}</span>
										{#if objective.prerequisites.length > 0}
											<span class="prereq-count">
												{objective.prerequisites.length} prerequisite{objective.prerequisites
													.length !== 1
													? 's'
													: ''}
											</span>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
		{/if}
	{/if}
</div>

<ConfirmDialog
	open={showDeleteDialog}
	title="Delete Curriculum"
	message="Are you sure you want to delete this curriculum? All objectives in this curriculum will also be deleted. This action cannot be undone."
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

	.description {
		color: var(--text-secondary);
		margin-bottom: var(--space-6);
		line-height: 1.6;
	}

	.objectives-section {
		margin-top: var(--space-8);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.section-header h2 {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	.empty-objectives {
		padding: var(--space-8);
		background: var(--bg-secondary);
		border: 1px dashed var(--border-default);
		border-radius: var(--radius-lg);
		text-align: center;
		color: var(--text-secondary);
	}

	.objectives-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.objective-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.objective-item:hover {
		border-color: var(--accent-primary);
	}

	.objective-name {
		color: var(--text-primary);
		font-size: var(--text-sm);
	}

	.prereq-count {
		font-size: var(--text-xs);
		color: var(--text-tertiary);
		background: var(--bg-tertiary);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}
</style>
