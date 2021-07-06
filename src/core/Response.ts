import { ColorResolvable, MessageEmbed } from 'discord.js';

/** An extension of Discord MessageEmbeds for bot command responses */
export class Response extends MessageEmbed {
	public static DEFAULT_COLOR: ColorResolvable = '#a84cc7';
	public static ERROR_COLOR: ColorResolvable = '#cf3e30';
	public static WARN_COLOR: ColorResolvable = '#ffd438';
	public static SUCCESS_COLOR: ColorResolvable = '#2ecc71';

	/**
	 * @param message The response message
	 * @param color The color of the response embed
	 * @param emoji The emoji prefixing the response message
	 */
	constructor(message: string, color?: ColorResolvable, emoji?: string) {
		super({
			description: `${emoji ? emoji + ' ' : ''}${message}`,
			color: color || Response.DEFAULT_COLOR
		});
	}

	/**
	 * Displays a JavaScript error in the response embed
	 * @param error The error object
	 * @param label The label above the error message
	 */
	public setError(error: Error, label?: string): void {
		this.addField(label || 'Error message:', `\`\`\`${error.message}\`\`\``);
	}
}

/** A Response formatted for errors */
export class ErrorResponse extends Response {
	/**
	 * @param message The error message
	 * @param error The error object
	 * @param label The label above the error message
	 */
	constructor(message: string, error?: Error, label?: string) {
		super(message, Response.ERROR_COLOR, '❌');
		if (error)
			this.setError(error, label);
	}
}

/** A Response formatted for successful actions */
export class SuccessResponse extends Response {
	/**
	 * @param message The success message
	 */
	constructor(message: string) {
		super(message, Response.SUCCESS_COLOR, '✅');
	}
}

/** A Response formatted for warnings */
export class WarnResponse extends Response {
	/**
	 * @param message The warning message
	 */
	constructor(message: string) {
		super(message, Response.SUCCESS_COLOR, '✅');
	}
}