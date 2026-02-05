import { goto } from '$app/navigation';
import { commandRegistry, type Command } from './registry';
import { keyboardStore } from '$lib/stores/keyboard.svelte';

const navigationCommands: Command[] = [
	{
		id: 'nav.home',
		label: 'Go to Dashboard',
		shortcut: 'g h',
		category: 'Navigation',
		action: () => goto('/')
	},
	{
		id: 'nav.curricula',
		label: 'Go to Curricula',
		shortcut: 'g c',
		category: 'Navigation',
		action: () => goto('/curricula')
	},
	{
		id: 'nav.objectives',
		label: 'Go to Objectives',
		shortcut: 'g o',
		category: 'Navigation',
		action: () => goto('/objectives')
	},
	{
		id: 'nav.lessons',
		label: 'Go to Lessons',
		shortcut: 'g l',
		category: 'Navigation',
		action: () => goto('/lessons')
	},
	{
		id: 'nav.projects',
		label: 'Go to Projects',
		shortcut: 'g p',
		category: 'Navigation',
		action: () => goto('/projects')
	},
	{
		id: 'nav.journal',
		label: 'Go to Journal',
		shortcut: 'g j',
		category: 'Navigation',
		action: () => goto('/journal')
	},
	{
		id: 'nav.progress',
		label: 'Go to Progress',
		shortcut: 'g r',
		category: 'Navigation',
		action: () => goto('/progress')
	},
	{
		id: 'nav.settings',
		label: 'Go to Settings',
		shortcut: 'g s',
		category: 'Navigation',
		action: () => goto('/settings')
	}
];

const createCommands: Command[] = [
	{
		id: 'create.curriculum',
		label: 'New Curriculum',
		shortcut: 'n c',
		category: 'Create',
		action: () => goto('/curricula/new')
	},
	{
		id: 'create.objective',
		label: 'New Objective',
		shortcut: 'n o',
		category: 'Create',
		action: () => goto('/objectives/new')
	},
	{
		id: 'create.lesson',
		label: 'New Lesson',
		shortcut: 'n l',
		category: 'Create',
		action: () => goto('/lessons/new')
	},
	{
		id: 'create.project',
		label: 'New Project',
		shortcut: 'n p',
		category: 'Create',
		action: () => goto('/projects/new')
	},
	{
		id: 'create.note',
		label: 'New Note',
		shortcut: 'n n',
		category: 'Create',
		action: () => goto('/journal/new?type=note')
	}
];

const uiCommands: Command[] = [
	{
		id: 'ui.commandPalette',
		label: 'Open Command Palette',
		shortcut: 'Mod+k',
		category: 'UI',
		action: () => keyboardStore.openCommandPalette()
	},
	{
		id: 'ui.help',
		label: 'Show Keyboard Shortcuts',
		shortcut: '?',
		category: 'UI',
		action: () => keyboardStore.openHelp()
	}
];

export function registerDefaultCommands() {
	commandRegistry.registerMany([...navigationCommands, ...createCommands, ...uiCommands]);
}
