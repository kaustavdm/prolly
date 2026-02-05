export type KeyboardMode = 'normal' | 'new' | 'go' | 'edit' | 'delete' | 'search' | 'view' | 'mark';

interface KeyboardState {
	mode: KeyboardMode;
	pending: string[];
	commandPaletteOpen: boolean;
	helpOpen: boolean;
}

function createKeyboardStore() {
	let state = $state<KeyboardState>({
		mode: 'normal',
		pending: [],
		commandPaletteOpen: false,
		helpOpen: false
	});

	return {
		get mode() {
			return state.mode;
		},
		get pending() {
			return state.pending;
		},
		get commandPaletteOpen() {
			return state.commandPaletteOpen;
		},
		get helpOpen() {
			return state.helpOpen;
		},
		get modeDisplay() {
			if (state.mode === 'normal') return null;
			const pendingStr = state.pending.length > 0 ? state.pending.join(' ') + ' …' : '';
			return { mode: state.mode, pending: pendingStr };
		},
		setMode(mode: KeyboardMode) {
			state.mode = mode;
			state.pending = [];
		},
		addPending(key: string) {
			state.pending = [...state.pending, key];
		},
		reset() {
			state.mode = 'normal';
			state.pending = [];
		},
		openCommandPalette() {
			state.commandPaletteOpen = true;
		},
		closeCommandPalette() {
			state.commandPaletteOpen = false;
		},
		toggleCommandPalette() {
			state.commandPaletteOpen = !state.commandPaletteOpen;
		},
		openHelp() {
			state.helpOpen = true;
		},
		closeHelp() {
			state.helpOpen = false;
		},
		toggleHelp() {
			state.helpOpen = !state.helpOpen;
		}
	};
}

export const keyboardStore = createKeyboardStore();
