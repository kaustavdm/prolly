<script lang="ts">
	import { goto } from '$app/navigation';
	import { appStore } from '$lib/stores/app.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { noteService } from '$lib/services';
	import type { ValidationErrors } from '$lib/services/validation';
	import { NoteForm } from '$lib/components/note';

	let errors = $state<ValidationErrors>({});
	let submitting = $state(false);

	async function handleSubmit(data: { content: string; tags: string[] }) {
		if (!appStore.user || !appStore.personalSpace) return;

		submitting = true;
		errors = {};

		const result = await noteService.create({
			content: data.content,
			tags: data.tags,
			authorId: appStore.user.id,
			spaceId: appStore.personalSpace.id
		});

		if (result.success) {
			toastStore.success('Note created');
			goto('/journal');
		} else {
			if (result.error?.code === 'VALIDATION_ERROR' && result.error.field) {
				errors = { [result.error.field]: result.error.message };
			} else {
				toastStore.error(result.error?.message ?? 'Failed to create note');
			}
		}

		submitting = false;
	}

	function handleCancel() {
		goto('/journal');
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>New Journal Entry</h1>
	</header>

	<NoteForm {errors} {submitting} onsubmit={handleSubmit} oncancel={handleCancel} />
</div>

<style>
	.page {
		max-width: 720px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}
</style>
