import { Message } from 'discord.js';
import Argument from './Argument';

/** Represents a Subcommand */
export default class Subcommand {
	/** The arguments specific to this subcommand */
	public arguments: Argument[];
	/** The name usable to identify the subcommand (for example: enable or disable) */
	public identifiers: string[];
	/** Similar to Command#run method. The behavior of the executed subcommand */
	public run: (message: Message, args: string[], identifier: string) => void;
	// The identifier argument is the string specified by the user when triggering the subcommand. Useful for a enable/disable subcommand for example.
	/**
	 * @param identifier The possible names to use to call the subcommand
	 * @param args The arguments of the subcommand
	 * @param run The method to execute whenever this subcommand is called
	 */
	constructor(identifiers: string[], args: Argument[], run: (message: Message, args: string[], identifier: string) => void) {
		this.arguments = args;
		this.identifiers = identifiers;
		this.run = run;
	}
}