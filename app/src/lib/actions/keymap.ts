import { keyboardStore, type KeyboardMode } from '$lib/stores/keyboard.svelte';
import { normalizeKey, isCommandModeActive } from '$lib/commands/keyboard';

type KeyHandler = (event: KeyboardEvent) => void | boolean | Promise<void> | Promise<boolean>;

interface Keymap {
	[key: string]: KeyHandler | Keymap;
}

export function keymap(node: HTMLElement, keymapConfig: Keymap) {
	let currentMode: Keymap = keymapConfig;
	let modeStack: Keymap[] = [];

	const modeMap: Record<string, KeyboardMode> = {
		n: 'new',
		g: 'go',
		e: 'edit',
		d: 'delete',
		v: 'view',
		m: 'mark',
		'/': 'search'
	};

	function handleKeydown(event: KeyboardEvent) {
		const key = normalizeKey(event);

		if (!isCommandModeActive() && key !== 'Escape' && !key.startsWith('Mod+')) {
			return;
		}

		if (key === 'Mod+k') {
			event.preventDefault();
			keyboardStore.toggleCommandPalette();
			return;
		}

		if (key === '?' && isCommandModeActive()) {
			event.preventDefault();
			keyboardStore.toggleHelp();
			return;
		}

		const handler = currentMode[key];

		if (typeof handler === 'function') {
			const result = handler(event);
			if (result !== false) {
				event.preventDefault();
			}
			currentMode = keymapConfig;
			modeStack = [];
			keyboardStore.reset();
		} else if (typeof handler === 'object') {
			modeStack.push(currentMode);
			currentMode = handler;
			event.preventDefault();

			if (modeMap[key]) {
				keyboardStore.setMode(modeMap[key]);
			}
			keyboardStore.addPending(key);
		} else if (key === 'Escape') {
			event.preventDefault();
			currentMode = keymapConfig;
			modeStack = [];
			keyboardStore.reset();
			keyboardStore.closeCommandPalette();
			keyboardStore.closeHelp();
		}
	}

	// Listen on window for global shortcuts (node is not focusable by default)
	window.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			window.removeEventListener('keydown', handleKeydown);
		},
		update(newKeymap: Keymap) {
			keymapConfig = newKeymap;
			currentMode = keymapConfig;
			modeStack = [];
		}
	};
}
