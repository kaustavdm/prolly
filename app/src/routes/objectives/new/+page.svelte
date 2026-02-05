<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { objectiveService } from '$lib/services';
	import { ObjectiveForm } from '$lib/components/objective';
	import type { ValidationErrors } from '$lib/services/validation';

	let submitting = $state(false);
	let errors = $state<ValidationErrors>({});

	const initialCurriculumId = $derived($page.url.searchParams.get('curriculumId') ?? '');

	async function handleSubmit(data: {
		name: string;
		description: string;
		curriculumId: string;
		prerequisites: string[];
	}) {
		submitting = true;
		errors = {};

		const result = await objectiveService.create({
			name: data.name,
			description: data.description || undefined,
			curriculumId: data.curriculumId,
			prerequisites: data.prerequisites
		});

		submitting = false;

		if (result.success) {
			toastStore.success('Objective created');
			goto(`/objectives/${result.data!.id}`);
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else if (result.error?.code === 'DAG_CYCLE') {
				errors = { prerequisites: result.error.message };
			} else {
				toastStore.error(result.error?.message || 'Failed to create objective');
			}
		}
	}

	function handleCancel() {
		if (initialCurriculumId) {
			goto(`/curricula/${initialCurriculumId}`);
		} else {
			goto('/objectives');
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<nav class="breadcrumb">
			<a href="/objectives">Objectives</a>
			<span>/</span>
			<span>New</span>
		</nav>
		<h1>Create Objective</h1>
	</header>

	<ObjectiveForm
		{initialCurriculumId}
		{errors}
		{submitting}
		onsubmit={handleSubmit}
		oncancel={handleCancel}
	/>
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
