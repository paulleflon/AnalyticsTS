import { Message } from 'discord.js';
import BotClient from '../core/BotClient';
import Command from '../core/Command';
import Event from '../core/Event';

export default class extends Event {
	constructor(client: BotClient) {
		super(client, 'message');
	}

	public async execute(message: Message): Promise<void> {
		if (message.author.bot)
			return;
		const prefix: string = this.client.prefix;
		if (new RegExp(`^<@!?${this.client.user?.id}>$`).test(message.content)) {
			let msg = `**My prefix here is \`${prefix}\`**`;
			if (message.member && message.member.permissions.has('MANAGE_GUILD'))
				msg += `\n> You can change it with \`${prefix}set-prefix <your-prefix>\``;
			message.channel.send(msg);
			return;
		}

		let content = message.content;
		// Needs refactor
		if (content.toLowerCase().startsWith(prefix))
			content = content.slice(prefix.length);
		else if (content.startsWith(`<@${this.client.user?.id}>`))
			content = content.slice(`<@${this.client.user?.id}>`.length);
		else if (content.startsWith(`<@!${this.client.user?.id}>`))
			content = content.slice(`<@!${this.client.user?.id}>`.length);
		else
			return;
		if (content.trim().length == 0)
			return;

		const args: string[] = content.split(' ').filter(arg => arg.length > 0);
		const name: string = args.shift()!.toLowerCase();
		content = content.slice(name.length + 1);
		let command: Command;
		if (this.client.commands.has(name))
			command = this.client.commands.get(name)!;
		else if (this.client.aliases.has(name))
			command = this.client.commands.get(this.client.aliases.get(name)!)!;
		else
			return;
		command.run(message, args, content);
	}
}