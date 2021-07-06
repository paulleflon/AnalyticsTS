import { Guild, GuildChannel, Role, User } from 'discord.js';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { formatDate, formatTime } from './Time';

/**
 * A logging pattern.
 * Variables:
 *  - `{DATE}` The current date (YYYY-MM-DD)
 *  - `{MESSAGE}` The message to log
 *  - `{NAME}` The name of the logger
 *  - `{TIME}` The current time (hh:mm:ss.SSS)
 *  - `{TYPE}` The type of the message. Either `INFO`, `WARN`, or `ERROR`
 * 
 * By default: `[{DATE} {TIME}][{TYPE}][{NAME}] {MESSAGE}`
 */
export type LoggerPattern = string;
/**
 * The type of a log message
 */
export type LoggingType = 'INFO' | 'WARN' | 'ERROR';

/** A tool to log messages related to specific scopes */
export default class Logger {
	/** Path to the logs directory */
	private static LOGS_PATH: string = join(__dirname, '../..', 'logs');
	/** The name of the logger */
	public name: string;
	/** The pattern of the logger */
	public pattern: LoggerPattern;
	/** Whether to store logs from this logger in log files */
	public store: boolean;

	/**
	 * @param name The name of the logger
	 * @param pattern The pattern of the logger
	 * @param store Whether to store logs from this logger in log files
	 */
	constructor(name: string, pattern: LoggerPattern = '[{DATE} {TIME}][{TYPE}][{NAME}] {MESSAGE}', store = true) {
		this.name = name;
		this.pattern = pattern;
		this.store = store;
	}

	/**
	 * Formats a logging message from pattern
	 * @param type The type of the message
	 * @param message The message to log
	 */
	private format(type: LoggingType, message: string): string {
		let formatted: string = this.pattern;
		if (formatted.includes('{DATE}')) {
			const date: string = formatDate(new Date());
			formatted = formatted.replace(/{DATE}/g, date);
		}
		if (formatted.includes('{TIME}')) {
			const time: string = formatTime(new Date(), true, true);
			formatted = formatted.replace(/{TIME}/g, time);
		}
		if (formatted.includes('{MESSAGE}'))
			formatted = formatted.replace(/{MESSAGE}/g, message);
		if (formatted.includes('{NAME}'))
			formatted = formatted.replace(/{NAME}/g, this.name);
		if (formatted.includes('{TYPE}'))
			formatted = formatted.replace(/{TYPE}/g, type);
		return formatted;
	}

	/**
	 * Logs an error message 
	 * @param message The message to log 
	 */
	public error(...message: any[]): void {
		this.send('ERROR', message);
	}

	/**
	 * Logs an info message 
	 * @param message The message to log 
	 */
	public info(...message: any[]): void {
		this.send('INFO', message);
	}


	/**
	 * Saves a message in log files
	 * @param message The message to save
	 */
	private save(message: string): void {
		const file = `${formatDate()}.log`;
		if (!existsSync(Logger.LOGS_PATH))
			mkdirSync(Logger.LOGS_PATH);
		try {
			appendFileSync(join(Logger.LOGS_PATH, file), `${message}\r`);
		}
		catch (err) {
			this.raw('An error occured when trying to save logs:', err);
		}
	}

	/**
	 * Logs a message in the console 
	 * @param type The type of the message
	 * @param message The message to log
	 */
	private send(type: LoggingType, message: any[]): void {
		let msg = '';
		message.forEach(i => {
			if (typeof i === 'object')
				i = JSON.stringify(i);
			i = i.toString();
			msg += i + ' ';
		});
		msg = msg.slice(0, msg.length - 1);
		const formatted: string = this.format(type, msg);
		console.log(formatted);
		if (this.store)
			this.save(formatted);
	}

	/**
	 * Formats a User/Guild/Role object to log string: `NAME (ID)`
	 * @param object The object object to format
	 */
	public obj(object: User | Guild | Role): string {
		return `${object instanceof User ? object.tag : object.name} (${object.id})`;
	}

	/**
	 * Formats a GuildChannel object to log string: `[T]NAME (ID)` With T the first letter of the channel type
	 * @param channel The GuildChannel object to format
	 */
	public channel(channel: GuildChannel): string {
		return `[${channel.type[0].toUpperCase()}]${channel.name} (${channel.id})`;
	}

	/**
	 * Logs a warn message 
	 * @param message The message to log 
	 */
	public warn(...message: any[]): void {
		this.send('WARN', message);
	}

	/**
	 * Shortcut to console.log. Useful to log objects
	 * @param message The message to log
	 */
	public raw(...message: any[]): void {
		console.log(message);
	}
}