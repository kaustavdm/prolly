<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { appStore } from '$lib/stores/app.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { lessonService } from '$lib/services/lesson';
	import { LessonForm } from '$lib/components/lesson';
	import type { ValidationErrors } from '$lib/services/validation';

	let submitting = $state(false);
	let errors = $state<ValidationErrors>({});

	const initialCurriculumId = $derived($page.url.searchParams.get('curriculumId') ?? '');

	async function handleSubmit(data: {
		name: string;
		description: string;
		content: string;
		curriculumId: string;
		objectiveIds: string[];
	}) {
		if (!appStore.personalSpace) {
			toastStore.error('No space available');
			return;
		}

		submitting = true;
		errors = {};

		const result = await lessonService.create({
			name: data.name,
			description: data.description || undefined,
			content: data.content || undefined,
			spaceId: appStore.personalSpace.id,
			curriculumId: data.curriculumId || undefined,
			objectiveIds: data.objectiveIds,
			resourceIds: []
		});

		submitting = false;

		if (result.success) {
			toastStore.success('Lesson created');
			goto(`/lessons/${result.data!.id}`);
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else {
				toastStore.error(result.error?.message || 'Failed to create lesson');
			}
		}
	}

	function handleCancel() {
		if (initialCurriculumId) {
			goto(`/curricula/${initialCurriculumId}`);
		} else {
			goto('/lessons');
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<nav class="breadcrumb">
			<a href="/lessons">Lessons</a>
			<span>/</span>
			<span>New</span>
		</nav>
		<h1>Create Lesson</h1>
	</header>

	<LessonForm
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
