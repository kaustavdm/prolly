<script lang="ts">
	import { FormField, TextInput, TextArea, FormActions } from '$lib/components/forms';
	import { CurriculumSelector } from '$lib/components/objective';
	import ObjectiveSelector from './ObjectiveSelector.svelte';
	import type { Lesson } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	interface Props {
		lesson?: Lesson;
		initialCurriculumId?: string;
		errors?: ValidationErrors;
		submitting?: boolean;
		onsubmit: (data: {
			name: string;
			description: string;
			content: string;
			curriculumId: string;
			objectiveIds: string[];
		}) => void;
		oncancel: () => void;
	}

	let {
		lesson,
		initialCurriculumId = '',
		errors = {},
		submitting = false,
		onsubmit,
		oncancel
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let name = $state(lesson?.name ?? '');
	// svelte-ignore state_referenced_locally
	let description = $state(lesson?.description ?? '');
	// svelte-ignore state_referenced_locally
	let content = $state(lesson?.content ?? '');
	// svelte-ignore state_referenced_locally
	let curriculumId = $state(lesson?.curriculumId ?? initialCurriculumId);
	// svelte-ignore state_referenced_locally
	let objectiveIds = $state<string[]>(lesson?.objectiveIds ?? []);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onsubmit({
			name: name.trim(),
			description: description.trim(),
			content: content.trim(),
			curriculumId,
			objectiveIds
		});
	}
</script>

<form onsubmit={handleSubmit} class="lesson-form">
	<FormField label="Name" name="name" required error={errors.name}>
		<TextInput bind:value={name} name="name" placeholder="e.g., Introduction to HTML" />
	</FormField>

	<FormField label="Description" name="description" error={errors.description}>
		<TextArea
			bind:value={description}
			name="description"
			placeholder="A brief summary of this lesson"
			rows={2}
		/>
	</FormField>

	<FormField label="Curriculum" name="curriculumId" helpText="Optional: Link to a curriculum">
		<CurriculumSelector bind:value={curriculumId} />
	</FormField>

	<FormField
		label="Linked Objectives"
		name="objectiveIds"
		helpText="Select objectives this lesson addresses"
		error={errors.objectiveIds}
	>
		<ObjectiveSelector {curriculumId} bind:value={objectiveIds} error={errors.objectiveIds} />
	</FormField>

	<FormField label="Content" name="content" helpText="Lesson content (supports Markdown)">
		<TextArea
			bind:value={content}
			name="content"
			placeholder="Write your lesson content here..."
			rows={10}
		/>
	</FormField>

	<FormActions
		submitLabel={lesson ? 'Save Changes' : 'Create Lesson'}
		{submitting}
		{oncancel}
	/>
</form>

<style>
	.lesson-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: 700px;
	}
</style>
