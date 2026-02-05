<script lang="ts">
	import { goto } from '$app/navigation';
	import { appStore } from '$lib/stores/app.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { projectService } from '$lib/services/project';
	import { ProjectForm } from '$lib/components/project';
	import type { Project } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	let submitting = $state(false);
	let errors = $state<ValidationErrors>({});

	async function handleSubmit(data: {
		name: string;
		description: string;
		status: Project['status'];
		objectiveIds: string[];
	}) {
		if (!appStore.personalSpace) {
			toastStore.error('No space available');
			return;
		}

		submitting = true;
		errors = {};

		const result = await projectService.create({
			name: data.name,
			description: data.description || undefined,
			spaceId: appStore.personalSpace.id,
			status: data.status,
			objectiveIds: data.objectiveIds,
			milestones: []
		});

		submitting = false;

		if (result.success) {
			toastStore.success('Project created');
			goto(`/projects/${result.data!.id}`);
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else {
				toastStore.error(result.error?.message || 'Failed to create project');
			}
		}
	}

	function handleCancel() {
		goto('/projects');
	}
</script>

<div class="page">
	<header class="page-header">
		<nav class="breadcrumb">
			<a href="/projects">Projects</a>
			<span>/</span>
			<span>New</span>
		</nav>
		<h1>Create Project</h1>
	</header>

	<ProjectForm {errors} {submitting} onsubmit={handleSubmit} oncancel={handleCancel} />
</div>

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

	h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}
</style>
