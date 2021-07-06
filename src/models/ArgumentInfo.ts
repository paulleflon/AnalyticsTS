import { Guild } from 'discord.js';
import { ArgumentType } from '../core/Argument';

interface ArgumentInfo {
	/** If the argument is of type `string`, specifies if it is case sensitive.
	 * @default false
	 */
	case?: boolean,
	/** If this argument's type is `custom`, its type name */
	customTypeName?: string,
	/** The default value for the argument */
	default?: any,
	/** A custom message to send if the given value isn't valid for the argument */
	invalidMessage?: string,
	/** The key of the argument. Must be unique in a command */
	key: string,
	/** The label/description of the argument */
	label?: string,
	/** If `type` is: 
	 *  - `number` The maximum value of the number
	 *  - `duration` The maximum amount of milliseconds 
	 *  - `string` The maximum length of the string
	 */
	max?: number,
	/** If `type` is: 
	 *  - `number` The minimum value of the number
	 *  - `duration` The minimum amount of milliseconds 
	 *  - `string` The minimum length of the string
	 */
	min?: number,
	/** An array of the argument's possible values */
	of?: any[],
	/** Whether the argument is required or not */
	required?: boolean,
	/** The type of the argument */
	type?: ArgumentType,
	/** A method testing if a given value is valid in the argument, overriding the default argument validator 
	 * @param input The value to test
	 * @param guild The guild to fetch data from
	*/
	validator?: (input: string, guild?: Guild) => boolean,
}
export default ArgumentInfo;