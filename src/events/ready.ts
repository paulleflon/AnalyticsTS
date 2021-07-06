import BotClient from '../core/BotClient';
import Event from '../core/Event';

export default class extends Event {
	constructor(client: BotClient) {
		super(client, 'ready', true);
	}

	public async execute(): Promise<void> {
		this.log.info(`Connected as ${this.client.user?.tag}`);
	}
}