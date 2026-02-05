<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import { LessonCard } from '$lib/components/lesson';
	import { EmptyState, LinkButton } from '$lib/components/ui';
	import type { Lesson, Curriculum } from '$lib/models';

	let lessons = $state<Lesson[]>([]);
	let curricula = $state<Map<string, Curriculum>>(new Map());

	$effect(() => {
		if (!appStore.personalSpace) return;

		const lessonSub = liveQuery(() =>
			db.lessons
				.where('spaceId')
				.equals(appStore.personalSpace!.id)
				.and((l) => !l.deletedAt)
				.reverse()
				.sortBy('createdAt')
		).subscribe({
			next: (value) => (lessons = value),
			error: (err) => console.error(err)
		});

		const currSub = liveQuery(() => db.curricula.toArray()).subscribe({
			next: (value) => {
				const map = new Map<string, Curriculum>();
				value.forEach((c) => map.set(c.id, c));
				curricula = map;
			},
			error: console.error
		});

		return () => {
			lessonSub.unsubscribe();
			currSub.unsubscribe();
		};
	});
</script>

<div class="page">
	<header class="page-header">
		<h1>Lessons</h1>
		<LinkButton href="/lessons/new">New Lesson</LinkButton>
	</header>

	{#if lessons.length === 0}
		<EmptyState
			title="No lessons yet"
			description="Create lessons to organize your learning content."
			actionHref="/lessons/new"
			actionLabel="Create Lesson"
		/>
	{:else}
		<ul class="entity-list">
			{#each lessons as lesson}
				<li>
					<LessonCard {lesson} curriculum={curricula.get(lesson.curriculumId ?? '')} />
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.page {
		max-width: 960px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
		font-weight: 600;
	}

	.entity-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
