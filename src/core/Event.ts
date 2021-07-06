import { ClientEvents } from 'discord.js';
import BotClient from './BotClient';
import Logger from './Logger';

/** A bot event */
export default abstract class Event {
	/** The client the event belongs to */
	protected client: BotClient;
	/** The logger for this event */
	public log: Logger;
	/** The name of the event */
	public name: keyof ClientEvents;
	/** The client the event belongs to */
	public once: boolean;

	/**
	 * @param client The client the event belongs to
	 * @param name The name of the event
	 * @param once Whether to fire the event only once
	 */
	constructor(client: BotClient, name: keyof ClientEvents, once = false) {
		this.client = client;
		this.name = name;
		this.log = new Logger(`Event-${this.name}`);
		this.once = once;
	}

	/** The event handler function */
	public abstract execute(...args: unknown[]): void;
}