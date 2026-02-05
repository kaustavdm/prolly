export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
}

function createToastStore() {
	let toasts = $state<Toast[]>([]);

	return {
		get toasts() {
			return toasts;
		},

		show(type: ToastType, message: string, duration = 5000): string {
			const id = crypto.randomUUID();
			toasts = [...toasts, { id, type, message, duration }];

			if (duration > 0) {
				setTimeout(() => this.dismiss(id), duration);
			}
			return id;
		},

		success(message: string, duration?: number) {
			return this.show('success', message, duration);
		},

		error(message: string, duration = 8000) {
			return this.show('error', message, duration);
		},

		warning(message: string, duration?: number) {
			return this.show('warning', message, duration);
		},

		info(message: string, duration?: number) {
			return this.show('info', message, duration);
		},

		dismiss(id: string) {
			toasts = toasts.filter((t) => t.id !== id);
		},

		clear() {
			toasts = [];
		}
	};
}

export const toastStore = createToastStore();
