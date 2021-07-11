import { Intents, Snowflake } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '../.env' });
import BotClient from './core/BotClient';
const client: BotClient = new BotClient({
	admins: process.env.ADMINS?.split(',').filter(id => /(\d){17,19}/.test(id)) as Snowflake[],
	owner: process.env.OWNER! as Snowflake,
	prefix: process.env.GLOBAL_PREFIX!,
	intents: Object.values(Intents.FLAGS), // Taking all intents for now. Should choose them later on
	restTimeOffset: 10,
	allowedMentions: { 
                repliedUser: false,
                parse: ['everyone']
	},
	token: process.env.DISCORD_TOKEN!,
	test: process.env.TEST === 'true'
});

client.start();
