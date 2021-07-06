import { Channel, Client as Client, Collection, Guild, PermissionString, Snowflake, User, UserResolvable } from 'discord.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import BotClientOptions from '../models/BotClientOptions';
import Command from './Command';
import Event from './Event';
import Logger from './Logger';

/** An extended Discord client for the bot */
export default class BotClient extends Client {
	/** The bot's admins. Can run admin commands */
	public admins: User[];
	/** A collection containing command aliases and their corresponding command names */
	public aliases: Collection<string, string>;
	/** The bot's commands */
	public commands: Collection<string, Command>;
	/** The bot's global logger */
	public log: Logger;
	/** A collection storing all client's commands names indexed by the module they belong to */
	public modules: Collection<string, string[]>;
	/** The bot's owner. Can use any command and bypass commands' Guild permissions */
	public owner!: User;
	/** The global prefix of the bot */
	public prefix: string;
	/** Whether the bot is in test mod. */
	public test: boolean;
	/** The Discord token to authenticate the bot with */
	#token: string;
	/** The bot's version */
	public version: string;

	/**
	 * @param options The instanciation options for the client
	 */
	constructor(options: BotClientOptions) {
		super(options);
		this.admins = [];
		this.aliases = new Collection();
		this.commands = new Collection();
		this.log = new Logger('Analytics');
		this.modules = new Collection();
		this.prefix = options.prefix;
		this.test = options.test || false;
		this.#token = options.token;
		this.version = options.version || (this.test) ? 'test' : 'null';

		this.once('ready', async () => {
			try {
				const _owner: User = await this.users.fetch(options.owner);
				this.owner = _owner;
			} catch (err) {
				throw Error('The bot must have an owner');
			}
			if (options.admins && options.admins.length > 0) {
				options.admins.forEach(async id => {
					const _admin: User = await this.users.fetch(id);
					if (_admin)
						this.admins.push(_admin);
				});
			}
			this.admins.push(this.owner);
		});
	}

	/** Connects the bot to Discord */
	public connect(): void {
		this.login(this.#token);
	}

	/**
	   * Converts a PermissionString to a user friendly format
	   * @param permission The permission to format
	   */
	public formatPermision(permission: PermissionString): string {
		return permission.toLowerCase().replace('guild', 'server').split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
	}

	/**
	 * Checks if a user is a bot admin
	 * @param user The user to test 
	 */
	public isAdmin(user: UserResolvable): boolean {
		const id: string | null = this.users.resolveId(user);
		if (id === null) return false;
		return !!this.admins.find(u => u.id === id);
	}

	/** Loads modules and their commands into the bot */
	public async loadModules(): Promise<void> {
		let loaded = 0;
		let errored = 0;
		const basePath: string = join(__dirname, '..', 'commands');
		const directories: string[] = (await fs.readdir(basePath, { withFileTypes: true }))
			.filter(file => file.isDirectory())
			.map(dir => dir.name);
		directories.forEach(async dir => {
			const module = require(join(basePath, dir, 'index')); // eslint-disable-line
			if (!module.NAME) {
				this.log.error(`Could't load module from directory ${dir} because it doesn't have a name.`);
				errored++;
				return;
			}
			const name: string = module.NAME;
			delete module.NAME;
			Object.keys(module).forEach(key => {
				const cmd: Command = new module[key](this);
				this.commands.set(cmd.name, cmd);
				if (cmd.aliases) {
					cmd.aliases.forEach(alias => {
						this.aliases.set(alias, cmd.name);
					});
				}
			});
			this.log.info(`Loaded module ${name}`);
			loaded++;
		});
		this.log.info(`Succefully loaded ${loaded}/${directories.length} module${loaded > 1 ? 's' : ''}`);
		if (errored > 0)
			this.log.warn(`${errored} module${errored > 1 ? 's' : ''} failed to load.`);
	}

	/** Loads events into the bot */
	public async loadEvents(): Promise<void> {
		let loaded = 0;
		let errored = 0;
		const basePath: string = join(__dirname, '..', 'events');
		const files: string[] = await fs.readdir(basePath);
		files.forEach(async file => {
			try {
				const _class = require(join(basePath, file)).default; // eslint-disable-line
				const event: Event = new _class(this);
				this[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
				this.log.info(`Loaded '${event.name}' event.`);
				loaded++;
			} catch (err) {
				this.log.error(`Event from file '${file}' couldn't be loaded.`, err);
				errored++;
			}
		});
		this.log.info(`Sucessfully loaded ${loaded}/${files.length} event${loaded > 1 ? 's' : ''}.`);
		if (errored > 0)
			this.log.warn(`${errored} event${errored > 1 ? 's' : ''} failed to load.`);
	}

	/** Loads events, commands and starts the bot */
	public start(): void {
		this.loadModules();
		this.loadEvents();
		this.connect();
	}

	/**
	 * Finds what kind of Discord object a Snowflake refers to 
	 * @param id A Discord Snowflake
	 * @param guild The guild to search in, required to detect a role Snowflake
	 */
	public async whatIs(id: Snowflake, guild?: Guild): Promise<'category' | 'emoji' | 'role' | 'textchannel' | 'user' | 'voicechannel' | null> {
		let channel: Channel;
		if ((channel = this.channels.resolve(id)!)) {
			switch (channel.type) {
				case 'category': return 'category';
				case 'news':
				case 'text':
					return 'textchannel';
				case 'voice':
					return 'voicechannel';
				default:
					return null;
			}
		}
		if (this.emojis.resolve(id))
			return 'emoji';
		if (guild && guild.roles.resolve(id))
			return 'role';
		try {
			if ((await this.users.fetch(id)))
				return 'user';
		} catch (err) {
			return null;
		}
		return null;
	}
}