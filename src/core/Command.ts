import { Message, PermissionString } from 'discord.js';
import CommandExample from '../models/CommandExample';
import CommandInfo from '../models/CommandInfo';
import Argument from './Argument';
import BotClient from './BotClient';
import Logger from './Logger';
import { ErrorResponse } from './Response';

/** A bot command */
export default abstract class Command implements CommandInfo {
	public admin: boolean;
	public aliases: string[];
	public arguments: Argument[];
	public client: BotClient;
	public cooldown: number;
	/** Whether this command is globally disabled. */
	public disabled: boolean;
	public description: string;
	public dm: boolean;
	public examples: CommandExample[];
	public hidden: boolean;
	/** The logger used to log command related messsages */
	public log: Logger;
	public module: string;
	public myPerms: PermissionString[];
	public readonly name: string;
	public perms: PermissionString[];
	public silent: boolean;

	/** 
	 * @param client The client the command belongs to
	 * @param options The options to create the command
	 */
	constructor(client: BotClient, options: CommandInfo) {
		this.client = client;
		this.admin = options.admin || false;
		this.aliases = options.aliases || [];
		this.arguments = options.arguments || [];
		this.cooldown = (options.cooldown && options.cooldown > 0) ? options.cooldown : 0;
		this.description = options.description;
		this.disabled = false;
		this.dm = options.dm || false;
		this.examples = options.examples || [];
		this.hidden = this.admin || options.hidden || false;
		this.module = options.module;
		this.myPerms = options.myPerms || [];
		this.perms = options.perms || [];
		this.silent = options.silent || false;
		this.name = options.name.toLowerCase();
		if (client.commands.findKey(cmd => cmd.name === this.name))
			throw new Error('Command names must be unique within a single client');
		this.log = new Logger(`Command-${this.name}`);
	}

	// TODO - Find a way to implement this as a decorator. 
	// When done, rename to check

	/**
	 * Runs permissions, cooldown checks and database save. 
	 * @param message The message triggering the command
	 * @param args The arguments given by the user. Useful for subcommand automatic run
	 */
	protected async preRun(message: Message): Promise<boolean> {
		if (!this.dm && message.channel.type === 'dm') {
			message.channel.send('This command can\'t be run in DMs. Please use it in a server.');
			return false;
		}
		if (!this.client.isAdmin(message.author)) {
			if (this.admin)
				return false;

			if (this.cooldown > 0) {
				// TODO: Implement cooldown with database save of cooldowned users
			}
			if (this.perms) {
				const missing: PermissionString[] = this.perms.filter(perm => !message.member?.permissions.has(perm));
				if (missing.length > 0) {
					if (!this.silent) {
						const embed = new ErrorResponse(`You need the ${missing.map(perm => `\`${this.client.formatPermision(perm)}\``).join(', ')} permission${missing.length > 1 ? 's' : ''} to run this command.`);
						message.channel.send({ embeds: [embed] });
					}
					return false;
				}
			}
			if (this.myPerms) {
				const missing: PermissionString[] = this.myPerms.filter(perm => !message.guild?.me?.permissions.has(perm));
				if (missing.length > 0) {
					if (!this.silent) {
						const embed = new ErrorResponse(`I need the ${missing.map(perm => `\`${this.client.formatPermision(perm)}\``).join(', ')} permission${missing.length > 1 ? 's' : ''} to run this command.`);
						message.channel.send({ embeds: [embed] });
					}
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * The behavior of a command 
	 * @param message The message triggering the command
	 * @param args The parsed arguments
	 * @param content The message content without prefix and command name
	 */
	public abstract run(message: Message, args: string[], content: string): void;
}