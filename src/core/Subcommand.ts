import { Message } from 'discord.js';
import Argument from './Argument';
import Command from './Command';

/** Represents a Subcommand */
export default class Subcommand {
	/** The arguments specific to this subcommand */
	public arguments: Argument[];
	/** The name usable to identify the subcommand (for example: enable or disable) */
	public identifiers: string[];
	/** Similar to Command#run method. The behavior of the executed subcommand */
	public run: (context: Command, message: Message, args: string[], identifier: string) => void;
	// The context argument replaces a 'this' in a regular command executor. 
	// The identifier argument is the string specified by the user when triggering the subcommand. Useful for a enable/disable subcommand for example.
	/**
	 * @param client The client
	 * @param identifiers The strings usable to call this subcommand
	 * @param run The method to execute whenever this subcommand is called
	 */
	constructor(identifiers: string[], args: Argument[], run: (context: Command, message: Message, args: string[], identifier: string) => void) {
		this.arguments = args;
		this.identifiers = identifiers;
		this.run = run;
	}
}