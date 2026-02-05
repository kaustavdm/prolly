<script lang="ts">
	import { FormField, TextInput, TextArea, Select, FormActions } from '$lib/components/forms';
	import { ObjectiveSelector } from '$lib/components/lesson';
	import type { Project } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	interface Props {
		project?: Project;
		errors?: ValidationErrors;
		submitting?: boolean;
		onsubmit: (data: {
			name: string;
			description: string;
			status: Project['status'];
			objectiveIds: string[];
		}) => void;
		oncancel: () => void;
	}

	let { project, errors = {}, submitting = false, onsubmit, oncancel }: Props = $props();

	// svelte-ignore state_referenced_locally
	let name = $state(project?.name ?? '');
	// svelte-ignore state_referenced_locally
	let description = $state(project?.description ?? '');
	// svelte-ignore state_referenced_locally
	let status = $state<Project['status']>(project?.status ?? 'planning');
	// svelte-ignore state_referenced_locally
	let objectiveIds = $state<string[]>(project?.objectiveIds ?? []);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onsubmit({
			name: name.trim(),
			description: description.trim(),
			status,
			objectiveIds
		});
	}
</script>

<form onsubmit={handleSubmit} class="project-form">
	<FormField label="Name" name="name" required error={errors.name}>
		<TextInput bind:value={name} name="name" placeholder="e.g., Build a Personal Portfolio" />
	</FormField>

	<FormField label="Description" name="description" error={errors.description}>
		<TextArea
			bind:value={description}
			name="description"
			placeholder="What is this project about?"
			rows={3}
		/>
	</FormField>

	<FormField label="Status" name="status">
		<Select bind:value={status} name="status">
			<option value="planning">Planning</option>
			<option value="active">Active</option>
			<option value="completed">Completed</option>
			<option value="archived">Archived</option>
		</Select>
	</FormField>

	<FormField
		label="Linked Objectives"
		name="objectiveIds"
		helpText="Select objectives this project addresses"
		error={errors.objectiveIds}
	>
		<ObjectiveSelector bind:value={objectiveIds} error={errors.objectiveIds} />
	</FormField>

	<FormActions
		submitLabel={project ? 'Save Changes' : 'Create Project'}
		{submitting}
		{oncancel}
	/>
</form>

<style>
	.project-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: 600px;
	}
</style>
