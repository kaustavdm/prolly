export interface Command {
	id: string;
	label: string;
	shortcut?: string;
	icon?: string;
	category?: string;
	action: () => void | Promise<void>;
	when?: () => boolean;
}

export interface CommandError {
	commandId: string;
	error: Error;
	timestamp: Date;
}

class CommandRegistry {
	private commands = new Map<string, Command>();
	private errorHandlers: ((error: CommandError) => void)[] = [];

	register(command: Command) {
		this.commands.set(command.id, command);
	}

	registerMany(commands: Command[]) {
		commands.forEach((cmd) => this.register(cmd));
	}

	unregister(id: string) {
		this.commands.delete(id);
	}

	get(id: string): Command | undefined {
		return this.commands.get(id);
	}

	onError(handler: (error: CommandError) => void) {
		this.errorHandlers.push(handler);
		return () => {
			this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
		};
	}

	async execute(id: string): Promise<void> {
		const command = this.commands.get(id);
		if (!command) {
			console.warn(`Command not found: ${id}`);
			return;
		}

		if (command.when && !command.when()) {
			console.warn(`Command not available: ${id}`);
			return;
		}

		try {
			await command.action();
		} catch (error) {
			const cmdError: CommandError = {
				commandId: id,
				error: error instanceof Error ? error : new Error(String(error)),
				timestamp: new Date()
			};
			console.error(`Command failed: ${id}`, error);
			this.errorHandlers.forEach((handler) => handler(cmdError));
		}
	}

	getAvailable(): Command[] {
		return Array.from(this.commands.values()).filter((cmd) => !cmd.when || cmd.when());
	}

	search(query: string): Command[] {
		const available = this.getAvailable();
		if (!query.trim()) return available;

		const lowerQuery = query.toLowerCase();
		return available
			.filter((cmd) => {
				const label = cmd.label.toLowerCase();
				const category = (cmd.category || '').toLowerCase();
				return label.includes(lowerQuery) || category.includes(lowerQuery);
			})
			.sort((a, b) => {
				const aLabel = a.label.toLowerCase();
				const bLabel = b.label.toLowerCase();
				const aStarts = aLabel.startsWith(lowerQuery);
				const bStarts = bLabel.startsWith(lowerQuery);
				if (aStarts && !bStarts) return -1;
				if (!aStarts && bStarts) return 1;
				return aLabel.localeCompare(bLabel);
			});
	}

	getByCategory(): Map<string, Command[]> {
		const categories = new Map<string, Command[]>();
		for (const cmd of this.getAvailable()) {
			const category = cmd.category || 'General';
			const existing = categories.get(category) || [];
			existing.push(cmd);
			categories.set(category, existing);
		}
		return categories;
	}
}

export const commandRegistry = new CommandRegistry();
