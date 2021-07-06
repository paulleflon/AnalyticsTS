import { Guild, GuildMember, Snowflake } from 'discord.js';
import ArgumentInfo from '../models/ArgumentInfo';
import BotClient from './BotClient';
import { parseDuration } from './Time';

/**
 * Specifies the type of an argument. Can be:
 *  - `boolean` A boolean
 *  - `category` A channel category
 *  - `channel` A channel of any type
 *  - `custom` A custom type
 *  - `duration` A duration, parsed to milliseconds
 *  - `emoji` An emoji
 *  - `member` A GuildMember. Requires the same input as `user`
 *  - `number` A number
 *  - `role` A role
 *  - `string` A string
 *  - `textchannel` A text channel
 *  - `user` A Discord user
 *  - `voicechannel` A voice channel
 */
export type ArgumentType = 'boolean' | 'category' | 'channel' | 'custom' | 'duration' | 'emoji' | 'json' | 'member' | 'number' | 'role' | 'string' | 'textchannel' | 'user' | 'voicechannel';

/** Represents a command Argument */
export default class Argument implements ArgumentInfo {

	public static CHANNEL_MENTION = /^(?:<#)?(\d{17,19})>?$/;
	public static EMOJI_MENTION = /^<a?:(\w+):(\d{17,19})>$/;
	public static ROLE_MENTION = /^(?:<@&)?(\d{17,19})>?$/;
	public static USER_MENTION = /^(?:<@!?)?(\d{17,19})>?$/;
	public case: boolean;
	public customTypeName?: string;
	public invalidMessage: string;
	public readonly key: string;
	public label?: string;
	public max?: number;
	public min?: number;
	public of?: any[];
	public required: boolean;
	public type: ArgumentType;
	public validator?: (input: string, guild?: Guild) => boolean;
	private client: BotClient;

	/**
	 * @param client The client this argument belongs to
	 * @param options 
	 */
	constructor(client: BotClient, options: ArgumentInfo) {
		this.client = client;
		this.key = options.key;
		this.required = options.required || false;
		this.type = options.type || 'string';
		this.label = options.label;
		this.of = (options.of && options.of.length && options.of.length > 0) ? options.of : undefined;
		this.case = options.case || false;
		this.invalidMessage = options.invalidMessage || `Wrong value provided for argument ${this.key}`;
		this.validator = options.validator;
		if (options.customTypeName)
			this.customTypeName = options.customTypeName;
		switch (this.type) {
			case 'duration':
			case 'number':
				if ((typeof options.min === 'number' && typeof options.max === 'number') && options.min >= options.max)
					throw new Error('Argument\'s minimum value must be strictly inferior than Argument\'s maximum value');
				if (this.type === 'duration' && ((typeof options.min === 'number' && options.min < 0) || (typeof options.max === 'number' && options.max < 0)))
					throw new RangeError('Argument of type \'duration\' must have positive minimum and maximum');
				this.min = options.min;
				this.max = options.max;
				break;
			case 'string':
				this.case = options.case || false;
				if (!this.case && this.of)
					this.of = this.of.map(i => i.toLowerCase());
				break;
		}
	}

	/** The default Argument validator
	 * @param input The value to test
	 * @param guild The guild to fetch data from
	*/
	private async defaultValidator(input: string, guild?: Guild): Promise<boolean> {
		if (!input)
			return false;
		if (this.required && input.trim() === '')
			return false;

		if (this.of)
			return (this.case) ? this.of.includes(input) : this.of.includes(input.toLowerCase());

		if (['category', 'channel', 'textchannel', 'voicechannel', 'member', 'role'].includes(this.type) && !guild)
			return false;
		switch (this.type) {
			case 'boolean':
				return ['on', 'off', 'true', 'false', '0', '1', 'yes', 'no'].includes(input.toLowerCase());
			case 'category':
			case 'channel':
			case 'textchannel':
			case 'voicechannel': {
				if (!Argument.CHANNEL_MENTION.test(input))
					return false;
				const snowflake: Snowflake = Argument.CHANNEL_MENTION.exec(input)![1] as Snowflake;
				const is: string | null = await this.client.whatIs(snowflake, guild);
				if (is === null)
					return false;
				if (this.type === 'channel')
					return ['category', 'textchannel', 'voicechannel'].includes(is);
				return this.type === is;
			}
			case 'duration':
			case 'number': {
				const val: number | null = (this.type === 'duration') ? parseDuration(input) : parseFloat(input);
				if (val === null || isNaN(val))
					return false;
				if (typeof this.min === 'number' && this.min > val)
					return false;
				if (typeof this.max === 'number' && this.max < val)
					return false;
				break;
			}
			case 'emoji':
				return /^\p{Emoji_Presentation}$/u.test(input) || Argument.EMOJI_MENTION.test(input);
			case 'json':
				try {
					JSON.parse(input);
					return true;
				} catch (_err) {
					return false;
				}
			case 'member':
			case 'user': {
				if (!Argument.USER_MENTION.test(input))
					return false;
				const snowflake: Snowflake = Argument.CHANNEL_MENTION.exec(input)![1] as Snowflake;
				const is: string | null = await this.client.whatIs(snowflake, guild);
				if (is !== 'user')
					return false;
				if (this.type === 'member') {
					try {
						await guild?.members.fetch(snowflake);
					} catch (err) {
						return false;
					}
				}
				return true;
			}
			case 'role': {
				if (!Argument.ROLE_MENTION.test(input))
					return false;
				const snowflake: Snowflake = Argument.ROLE_MENTION.exec(input)![1] as Snowflake;
				const is: string | null = await this.client.whatIs(snowflake, guild);
				return is === 'role';
			}
			case 'string':
				if (this.max && input.length > this.max)
					return false;
				if (this.min && input.length < this.min)
					return false;
				return true;
		}
		return true;
	}

	/**
	 * Tests if a value is valid for this argument
	 * @param input The value to test
	 * @param guild The guild to fetch data from
	 */
	public async isValid(input: string, guild?: Guild): Promise<boolean> {
		return (this.validator) ? this.validator(input, guild) : this.defaultValidator(input, guild);
	}

	/**
	 * Converts user input to correct data format
	 * @param input The input to fetch the value from
	 * @param guild The guild to fetch data from
	 */
	public async get(input: string, guild?: Guild): Promise<any> {
		const valid: boolean = await this.isValid(input, guild);
		if (!valid)
			return null;
		switch (this.type) {
			case 'custom':
			case 'string':
				return (this.case) ? input : input.toLowerCase();
			case 'category':
			case 'channel':
			case 'textchannel':
			case 'voicechannel': {
				const snowflake: Snowflake = Argument.CHANNEL_MENTION.exec(input)![1] as Snowflake;
				return guild?.channels.resolve(snowflake);
			}
			case 'duration':
				return parseDuration(input);
			case 'emoji':
				return input;
			case 'json':
				return JSON.parse(input);
			case 'number':
				return parseFloat(input);
			case 'user':
			case 'member': {
				const snowflake: Snowflake = Argument.USER_MENTION.exec(input)![1] as Snowflake;
				const member: GuildMember = (await guild?.members.fetch(snowflake))!;
				return (this.type === 'member') ? member : member.user;
			}
			case 'role': {
				const snowflake: Snowflake = Argument.ROLE_MENTION.exec(input)![1] as Snowflake;
				return guild?.roles.fetch(snowflake);
			}
			case 'boolean': {
				const val: string = input.toLowerCase();
				if (['on', 'true', 'yes', '1'].includes(val))
					return true;
				if (['off', 'false', 'no', '0'].includes(val))
					return false;
			}
				return null;
		}
	}
}