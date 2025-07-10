// index.js

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const { jomarResponses, harassment, randomMessages } = require('./responses.js');

global.commandLock = false;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	const startTime = Date.now();

	setInterval(() => {
		const elapsed = Date.now() - startTime;
		const totalSeconds = Math.floor(elapsed / 1000);

		const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
		const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
		const s = String(totalSeconds % 60).padStart(2, '0');

		process.stdout.write(`\rActive for: ${h}:${m}:${s}`);
	}, 1000);

	setInterval(() => {
		if (Math.random() < 0.05) {
			const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

			const targetChannel = client.channels.cache.find(
				channel => channel.name === 'gooneral-vii' && channel.isTextBased?.(),
			);

			if (targetChannel) {
				targetChannel.send(randomMessage).catch(console.error);
			}
			else {
				console.log('No target channel found for random message.');
			}
		}
	}, 5 * 60 * 1000);

	client.user.setActivity('Signing Executive Orders', {
		// eslint-disable-next-line no-inline-comments
		type: ActivityType.Playing, // Can also be: Watching, Listening, Competing
	});

	const logChannel = client.channels.cache.find(
		channel => channel.name === 'trump-osc' && channel.isTextBased?.(),
	);

	if (logChannel) {
		logChannel.send('Bigger. And. Better. I am the best Discord bot to ever exist.\nThere are no bots with an IQ higher than mines.\nI am so rich and famous, the world knows best. I am the best.');
	}
	else {
		console.log('No log channel found. Skipping startup message.');
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;


	if (global.commandLock) {
		return interaction.reply({
			content: 'I, Donald J (Jesus) Trump, am too busy running another command.',
			flags: MessageFlags.Ephemeral,
		});
	}

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.on('messageCreate', message => {
	if (message.author.bot) return;

	if (message.content.toLowerCase().includes('jomar')) {
		message.channel.send(jomarResponses[Math.floor(Math.random() * jomarResponses.length)]);
	}

	// eslint-disable-next-line no-inline-comments
	if (message.author.id === '827174001049862164') { // this is jomar's user id
		message.author.send('<@827174001049862164> ' + harassment[Math.floor(Math.random() * harassment.length)]).catch(console.error);
	}
});

client.login(token);
