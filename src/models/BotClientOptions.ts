import { ClientOptions as co, Snowflake } from 'discord.js';

interface BotClientOptions extends co {
	/** The bot's admins. Can run admin commands */
	admins?: Snowflake[],
	/** The bot's owner. Has admin permissions */
	owner: Snowflake,
	/** The global prefix of the bot */
	prefix: string,
	/** 
	 *  Whether the bot is in test mode. If `true`, it will ignore all non-owner messages
	 * 	@default false
	 */
	test?: boolean,
	/** The Discord token to authenticate the bot with */
	token: string,
	/** The bot's version */
	version?: string,
}
export default BotClientOptions;