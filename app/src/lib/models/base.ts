export interface BaseEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
	version: number;
	deletedAt?: string;
}

export type Role = 'learner' | 'educator' | 'mentor' | 'admin';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserSettings {
	theme: ThemePreference;
	keyboardLayout: string;
}

export interface SpaceSettings {
	visibility: 'private' | 'members' | 'public';
}
