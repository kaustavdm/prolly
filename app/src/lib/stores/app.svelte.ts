import { db, localDb, generateUUIDv7 } from '$lib/db';
import { userService, DEFAULT_USER_ID } from '$lib/services';
import type { User, Space } from '$lib/models';
import type { ThemePreference } from '$lib/models/base';

interface AppState {
	initialized: boolean;
	user: User | null;
	personalSpace: Space | null;
	theme: ThemePreference;
}

function createAppStore() {
	let state = $state<AppState>({
		initialized: false,
		user: null,
		personalSpace: null,
		theme: 'system'
	});

	return {
		get initialized() {
			return state.initialized;
		},
		get user() {
			return state.user;
		},
		get personalSpace() {
			return state.personalSpace;
		},
		get theme() {
			return state.theme;
		},
		setUser(user: User | null) {
			state.user = user;
		},
		setPersonalSpace(space: Space | null) {
			state.personalSpace = space;
		},
		setTheme(theme: ThemePreference) {
			state.theme = theme;
			applyTheme(theme);
			localDb.settings.put({ key: 'theme', value: theme });
		},
		setInitialized(value: boolean) {
			state.initialized = value;
		}
	};
}

export const appStore = createAppStore();

function applyTheme(preference: ThemePreference) {
	let theme: 'light' | 'dark';

	if (preference === 'system') {
		theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	} else {
		theme = preference;
	}

	document.documentElement.setAttribute('data-theme', theme);
}

export async function initializeApp() {
	if (appStore.initialized) return;

	const themeSetting = await localDb.settings.get('theme');
	if (themeSetting) {
		appStore.setTheme(themeSetting.value as ThemePreference);
	} else {
		applyTheme('system');
	}

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (appStore.theme === 'system') {
			applyTheme('system');
		}
	});

	// Get or create the default local user via UserService
	const userResult = await userService.getOrCreateDefault();
	if (!userResult.success || !userResult.data) {
		console.error('Failed to initialize user:', userResult.error);
		return;
	}
	const user = userResult.data;
	appStore.setUser(user);

	let personalSpace = await db.spaces.where('ownerId').equals(user.id).and((s) => s.type === 'personal').first();
	if (!personalSpace) {
		const now = new Date().toISOString();
		personalSpace = {
			id: generateUUIDv7(),
			name: 'Personal Space',
			type: 'personal',
			ownerId: user.id,
			settings: { visibility: 'private' },
			createdAt: now,
			updatedAt: now,
			version: 1
		};
		await db.spaces.add(personalSpace);
	}
	appStore.setPersonalSpace(personalSpace);

	appStore.setInitialized(true);
}
