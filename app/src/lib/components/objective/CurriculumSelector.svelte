<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import { Select } from '$lib/components/forms';
	import type { Curriculum } from '$lib/models';

	interface Props {
		value?: string;
		required?: boolean;
		disabled?: boolean;
	}

	let { value = $bindable(''), required = false, disabled = false }: Props = $props();

	let curricula = $state<Curriculum[]>([]);

	$effect(() => {
		if (!appStore.personalSpace) return;

		const subscription = liveQuery(() =>
			db.curricula
				.where('spaceId')
				.equals(appStore.personalSpace!.id)
				.and((c) => !c.deletedAt)
				.toArray()
		).subscribe({
			next: (v) => (curricula = v),
			error: console.error
		});

		return () => subscription.unsubscribe();
	});
</script>

<Select bind:value name="curriculumId" {required} {disabled}>
	<option value="">Select a curriculum...</option>
	{#each curricula as curriculum}
		<option value={curriculum.id}>{curriculum.name}</option>
	{/each}
</Select>
