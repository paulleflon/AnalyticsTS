import { PermissionString } from 'discord.js';
import Argument from '../core/Argument';
import Subcommand from '../core/Subcommand';
import CommandExample from './CommandExample';

/** The informations for a command */
interface CommandInfo {
	/** Whether this command is for bot admins only */
	admin?: boolean,
	/** The possible aliases to call the command with */
	aliases?: string[],
	/** The arguments for the command */
	arguments?: Argument[],
	/** The amount of milliseconds to wait before reusing the command */
	cooldown?: number,
	/** The description of the command */
	description: string,
	/** Whether the command can be run in DMs */
	dm?: boolean;
	/** The example uses for the command */
	examples?: CommandExample[],
	/** Whether this command is hidden (if it is accessible from help). Always true if `admin` is set to true */
	hidden?: boolean,
	/** The name of the module the command belongs to */
	module: string,
	/** The permissions the bots need in the guild to run */
	myPerms?: PermissionString[],
	/** The name of the command */
	name: string,
	/** The permissions the user requesting needs in the guild to run it */
	perms?: PermissionString[],
	/** Whether the command is silent or not. If true, no error message will be sent if a user doesn't have the authorization to use a command. Always true if `hidden` is true */
	silent?: boolean,
	/** The subcommands of the command */
	subcommands?: Subcommand[];
}
export default CommandInfo;