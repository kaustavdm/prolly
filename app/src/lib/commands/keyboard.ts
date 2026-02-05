export function normalizeKey(event: KeyboardEvent): string {
	const parts: string[] = [];

	if (event.metaKey || event.ctrlKey) {
		parts.push('Mod');
	}
	if (event.altKey) {
		parts.push('Alt');
	}
	if (event.shiftKey && event.key.length > 1) {
		parts.push('Shift');
	}

	let key = event.key;

	const keyMap: Record<string, string> = {
		' ': 'Space',
		ArrowUp: 'Up',
		ArrowDown: 'Down',
		ArrowLeft: 'Left',
		ArrowRight: 'Right'
	};
	key = keyMap[key] || key;

	if (key.length === 1) {
		key = key.toLowerCase();
	}

	parts.push(key);
	return parts.join('+');
}

export function isCommandModeActive(): boolean {
	const activeElement = document.activeElement;
	if (!activeElement) return true;

	const tagName = activeElement.tagName.toLowerCase();
	const isInput = tagName === 'input' || tagName === 'textarea';
	const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';

	return !isInput && !isContentEditable;
}

export function isMac(): boolean {
	return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function formatShortcut(shortcut: string): string {
	if (isMac()) {
		return shortcut
			.replace('Mod+', '⌘')
			.replace('Alt+', '⌥')
			.replace('Shift+', '⇧')
			.replace('Escape', 'esc');
	}
	return shortcut.replace('Mod+', 'Ctrl+');
}
