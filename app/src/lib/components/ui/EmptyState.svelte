<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		actionHref?: string;
		actionLabel?: string;
	}

	let { title, description, actionHref, actionLabel }: Props = $props();
</script>

<div class="empty-state">
	<h3>{title}</h3>
	{#if description}
		<p>{description}</p>
	{/if}
	{#if actionHref && actionLabel}
		<a href={actionHref} class="btn btn-primary">{actionLabel}</a>
	{/if}
</div>

<style>
	.empty-state {
		text-align: center;
		padding: var(--space-12);
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--border-default);
	}

	h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-2);
	}

	p {
		color: var(--text-secondary);
		margin-bottom: var(--space-4);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: 500;
		border-radius: var(--radius-md);
		text-decoration: none;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--accent-primary);
		color: white;
	}

	.btn-primary:hover {
		opacity: 0.9;
		text-decoration: none;
	}
</style>
