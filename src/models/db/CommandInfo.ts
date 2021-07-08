import { Snowflake } from 'discord.js';
import mongoose, { Schema } from 'mongoose';

/**
 * Command informations saved in database.
 */
export interface CommandInfo {
	/**
	 * The name of the command.
	 */
	name: string,
	/**
	 * The Date on which each user used the command for the last time.
	 */
	lastUses: Record<Snowflake, Date>
	/**
	 * Whether the command is disabled for every guilds/users.
	 */
	globallyDisabled: boolean
	/**
	 * The guilds that disabled the command.
	 */
	disabledAt: Snowflake[]
}

const schema: Schema = new Schema({
	name: String,
	lastUses: Object,
	globallyDisabled: Boolean,
	disabledAt: Array,
});

export default mongoose.model<CommandInfo>('CommandInfo', schema);