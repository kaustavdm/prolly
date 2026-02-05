<script lang="ts">
	import { FormField, TextArea, FormActions, TextInput } from '$lib/components/forms';
	import type { Note } from '$lib/models';
	import type { ValidationErrors } from '$lib/services/validation';

	interface Props {
		note?: Note;
		errors?: ValidationErrors;
		submitting?: boolean;
		onsubmit: (data: { content: string; tags: string[] }) => void;
		oncancel: () => void;
	}

	let { note, errors = {}, submitting = false, onsubmit, oncancel }: Props = $props();

	// svelte-ignore state_referenced_locally
	let content = $state(note?.content ?? '');
	// svelte-ignore state_referenced_locally
	let tagInput = $state(note?.tags?.join(', ') ?? '');

	function parseTags(input: string): string[] {
		return input
			.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter((t) => t.length > 0);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onsubmit({
			content: content.trim(),
			tags: parseTags(tagInput)
		});
	}
</script>

<form onsubmit={handleSubmit} class="note-form">
	<FormField label="Content" name="content" required error={errors.content}>
		<TextArea
			bind:value={content}
			name="content"
			placeholder="Write your thoughts, reflections, or notes..."
			rows={8}
		/>
	</FormField>

	<FormField label="Tags" name="tags" helpText="Comma-separated tags for organization">
		<TextInput
			bind:value={tagInput}
			name="tags"
			placeholder="e.g., reflection, progress, idea"
		/>
	</FormField>

	<FormActions submitLabel={note ? 'Save Changes' : 'Create Note'} {submitting} {oncancel} />
</form>

<style>
	.note-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
</style>
