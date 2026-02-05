<script lang="ts">
	import { FormField, TextInput, TextArea, FormActions } from '$lib/components/forms';
	import type { Curriculum } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	interface Props {
		curriculum?: Curriculum;
		errors?: ValidationErrors;
		submitting?: boolean;
		onsubmit: (data: { name: string; description: string }) => void;
		oncancel: () => void;
	}

	let { curriculum, errors = {}, submitting = false, onsubmit, oncancel }: Props = $props();

	let name = $state(curriculum?.name ?? '');
	let description = $state(curriculum?.description ?? '');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onsubmit({ name: name.trim(), description: description.trim() });
	}
</script>

<form onsubmit={handleSubmit} class="curriculum-form">
	<FormField label="Name" name="name" required error={errors.name}>
		<TextInput bind:value={name} name="name" placeholder="e.g., Web Development Fundamentals" />
	</FormField>

	<FormField label="Description" name="description" error={errors.description}>
		<TextArea
			bind:value={description}
			name="description"
			placeholder="What will this curriculum cover?"
			rows={4}
		/>
	</FormField>

	<FormActions
		submitLabel={curriculum ? 'Save Changes' : 'Create Curriculum'}
		{submitting}
		{oncancel}
	/>
</form>

<style>
	.curriculum-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: 600px;
	}
</style>
