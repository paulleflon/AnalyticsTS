import { Message, MessageEmbed } from 'discord.js';
import Argument from '../../core/Argument';
import BotClient from '../../core/BotClient';
import Command from '../../core/Command';
import { ErrorResponse, Response } from '../../core/Response';

export default class extends Command {
	constructor(client: BotClient) {
		super(client, {
			admin: true,
			aliases: ['js'],
			arguments: [
				new Argument(client, {
					key: 'expression',
					label: 'The expression to run',
					type: 'custom',
					customTypeName: 'JavaScript Expression',
					case: true,
				})
			],
			description: 'Evaluates a JavaScript expression',
			module: 'Admin',
			name: 'eval',
		});
	}

	public async run(message: Message, _args: string[], content: string): Promise<void> {
		if (!(await this.preRun(message)))
			return;
		const expression: string = content;
		try {
			let response: unknown = await eval(expression);
			const embed: MessageEmbed = new MessageEmbed()
				.setColor(Response.SUCCESS_COLOR)
				.setTitle('Sucessfully ran the expression')
				.addField('Expression', `\`\`\`js\n${expression}\`\`\``);
			if (typeof response === 'object') {
				response = JSON.stringify(response, undefined, 4);
				embed.addField('Result', `\`\`\`json\n${response}\`\`\``);
			}
			else
				embed.addField('Result', `\`\`\`\n${response}\`\`\``);
			await message.channel.send({ embeds: [embed] });
		} catch (err) {
			message.channel.send({ embeds: [new ErrorResponse('The expression threw an error', err)] });
		}
	}
}