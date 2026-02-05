<script lang="ts">
	import { FormField, TextInput, TextArea, FormActions } from '$lib/components/forms';
	import CurriculumSelector from './CurriculumSelector.svelte';
	import PrerequisiteSelector from './PrerequisiteSelector.svelte';
	import type { Objective } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	interface Props {
		objective?: Objective;
		initialCurriculumId?: string;
		errors?: ValidationErrors;
		submitting?: boolean;
		onsubmit: (data: {
			name: string;
			description: string;
			curriculumId: string;
			prerequisites: string[];
		}) => void;
		oncancel: () => void;
	}

	let {
		objective,
		initialCurriculumId = '',
		errors = {},
		submitting = false,
		onsubmit,
		oncancel
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let name = $state(objective?.name ?? '');
	// svelte-ignore state_referenced_locally
	let description = $state(objective?.description ?? '');
	// svelte-ignore state_referenced_locally
	let curriculumId = $state(objective?.curriculumId ?? initialCurriculumId);
	// svelte-ignore state_referenced_locally
	let prerequisites = $state<string[]>(objective?.prerequisites ?? []);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onsubmit({
			name: name.trim(),
			description: description.trim(),
			curriculumId,
			prerequisites
		});
	}
</script>

<form onsubmit={handleSubmit} class="objective-form">
	<FormField label="Curriculum" name="curriculumId" required error={errors.curriculumId}>
		<CurriculumSelector bind:value={curriculumId} required disabled={!!objective} />
	</FormField>

	<FormField label="Name" name="name" required error={errors.name}>
		<TextInput bind:value={name} name="name" placeholder="e.g., Understand HTTP methods" />
	</FormField>

	<FormField label="Description" name="description" error={errors.description}>
		<TextArea
			bind:value={description}
			name="description"
			placeholder="What should the learner be able to do?"
			rows={3}
		/>
	</FormField>

	<FormField
		label="Prerequisites"
		name="prerequisites"
		helpText="Select objectives that must be completed first"
		error={errors.prerequisites}
	>
		<PrerequisiteSelector
			{curriculumId}
			excludeId={objective?.id}
			bind:value={prerequisites}
			error={errors.prerequisites}
		/>
	</FormField>

	<FormActions
		submitLabel={objective ? 'Save Changes' : 'Create Objective'}
		{submitting}
		{oncancel}
	/>
</form>

<style>
	.objective-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: 600px;
	}
</style>
