import { DMChannel, Message, MessageEmbed, MessageEmbedOptions, MessageReaction, NewsChannel, ReactionCollector, TextChannel, User } from 'discord.js';
import { EventEmitter } from 'events';

/** A MessageEmbed interactive using message reactions */
export default class InteractiveEmbed extends EventEmitter {
	/** The ReactionCollector bound to the embed message */
	public collector?: ReactionCollector;
	/** The embed */
	public embed: MessageEmbed;
	/** The emojis to interact */
	protected emojis: string[];
	/** The embed data to change when the interactibility stops */
	protected killed?: MessageEmbedOptions;
	/**
	 * @param emojis The emojis to interact
	 * @param embed The embed
	 * @param killed The embed data to change when the interactibility stops
	 */
	constructor(emojis: string[], embed: MessageEmbed | MessageEmbedOptions, killed?: MessageEmbedOptions) {
		super();
		this.emojis = emojis;
		this.embed = new MessageEmbed(embed);
		this.killed = killed;
	}

	/**
	 * Sends an interactive embed
	 * @param channel The channel where the embed is sent
	 * @param user The user able to interact with the embed
	 */
	public async send(channel: TextChannel | NewsChannel | DMChannel, user: User): Promise<InteractiveEmbed> {
		const message: Message = await channel.send({ embeds: [this.embed] });
		this.emojis.forEach(async emoji => await message.react(emoji));
		this.collector = message.createReactionCollector({
			filter: (_reaction: MessageReaction, u: User) => u.id === user.id,
			idle: 60000,
			time: 180000
		});
		this.collector.on('collect', async (reaction, user) => {
			await reaction.users.remove(user);
			if (this.emojis.includes(reaction.emoji.identifier))
				this.emit(reaction.emoji.identifier, reaction, user);
		});
		this.collector.on('end', (_collected, reason) => {
			if (reason === 'HANDLED')
				return;
			message.reactions.removeAll();
			if (this.killed) {
				const embedJSON = this.embed.toJSON() as Record<string, string>;
				const data = { ...embedJSON, ...this.killed };
				this.embed = new MessageEmbed(data);
				message.edit({ embeds: [this.embed] });
			}
		});
		return this;
	}
}

/** Multiple MessageEmbeds paginated into one */
export class PaginatedEmbed extends EventEmitter {
	/** The ReactionCollector bound to the embed message */
	public collector?: ReactionCollector;
	/** The embeds to paginate */
	public embeds: MessageEmbed[];
	/** The embed data to change when the interactibility stops */
	private killed?: MessageEmbedOptions;
	/**
	 * @param embeds An array containing the embeds to paginate
	 * @param killed The embed data to change when the interactibility stops
	 */
	constructor(embeds: MessageEmbed[], killed?: MessageEmbedOptions) {
		super();
		if (embeds.length == 0)
			throw new Error('At least 1 MessageEmbed must be provided in a PaginatedEmbed.');
		this.embeds = embeds.map((embed, i) => {
			if (embed.footer)
				embed.footer.text = (embed.footer.text || '') + ` • Page ${i + 1}/${embeds.length}`;
			else
				embed.setFooter(`Page ${i + 1}/${embeds.length}`);
			return embed;
		});
		this.killed = killed;
	}

	/**
	 * Sends the paginated embeds
	 * @param channel The channel where the embed is sent
	 * @param user The user able to interact with the embeds
	 */
	public async send(channel: TextChannel | NewsChannel | DMChannel, user: User): Promise<PaginatedEmbed> {
		const message: Message = await channel.send({ embeds: [this.embeds[0]] });
		await message.react('⬅');
		await message.react('➡');
		let index = 0;
		const max: number = this.embeds.length - 1;
		this.collector = message.createReactionCollector({
			filter: (_reaction: MessageReaction, u: User) => u.id === user.id,
			idle: 60000,
			time: 180000
		});
		this.collector.on('collect', async reaction => {
			await reaction.users.remove(user);
			if (reaction.emoji.name === '⬅')
				index = (index - 1 < 0) ? max : index - 1;
			else if (reaction.emoji.name === '➡')
				index = (index + 1 > max) ? 0 : index + 1;
			await message.edit({ embeds: [this.embeds[index]] });
		});
		this.collector.on('end', (_collected, reason) => {
			if (reason === 'HANDLED')
				return;
			message.reactions.removeAll();
			if (this.killed) {
				const embedJSON = this.embeds[index].toJSON() as Record<string, string>;
				const data = { ...embedJSON, ...this.killed };
				message.edit({ embeds: [new MessageEmbed(data)] });
			}
		});
		return this;
	}
}

/** A menu in the form of an embed */
export class MenuEmbed extends InteractiveEmbed {
	public static emojis: string[] = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

	/**
	 * 
	 * @param choices The different choices 
	 * @param embed The embed to send. The formatted choices are added after the description
	 * @param killed The embed data to change when the interactibility stops
	 */
	constructor(choices: string[], embed: MessageEmbed | MessageEmbedOptions, killed?: MessageEmbedOptions) {
		if (choices.length > 10)
			throw new Error('A MenuEmbed can\'t have more than 10 choices.');
		super(MenuEmbed.emojis.slice(0, choices.length), embed, killed);
		choices.forEach((value, index) => {
			this.embed.description += `\n${MenuEmbed.emojis[index]} ${value}`;
		});
	}

	/**
	 * Sends a MenuEmbed
	 * @param channel The channel where the embed is sent
	 * @param user The user able to interact with the embed
	 */
	public async send(channel: TextChannel | NewsChannel | DMChannel, user: User): Promise<MenuEmbed> {
		await super.send(channel, user);
		return this;
	}
}