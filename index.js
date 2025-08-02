// index.js

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const { jomarResponses, harassment, randomMessages, epsteinMessages } = require('./responses.js');

const MINOR_ROLE_ID = '1298143821753745458';
const ROLE_CACHE = './rolecache.json';

const removedMinorRoleOnce = new Set();

const baseChance = 0;
const maxChance = 1;

let currentChance = baseChance;
let roleCache = {};

global.commandLock = false;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
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

if (fs.existsSync(ROLE_CACHE)) {
	try {
		const data = fs.readFileSync(ROLE_CACHE, 'utf8');
		roleCache = data.trim() ? JSON.parse(data) : {};
	}
	catch (err) {
		console.error('Error parsing rolecache.json:', err);
		roleCache = {};
	}
}

function saveRoleCache() {
	fs.writeFileSync(ROLE_CACHE, JSON.stringify(roleCache, null, 2));
}


client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	setInterval(() => {
		if (Math.random() < currentChance) {
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
			currentChance = baseChance;
		}
	}, 0.5 * 60 * 1000);

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

client.on('guildMemberRemove', (member) => {
	const roleIds = member.roles.cache
		.filter(role => !role.managed && role.id !== member.guild.id)
		.map(role => role.id);

	if (roleIds.length > 0) {
		roleCache[member.id] = {
			roles: roleIds,
			hadMinorRole: roleIds.includes('1298143821753745458'),
		};
		saveRoleCache();
	}
});

client.on('guildMemberAdd', async (member) => {
	const saved = roleCache[member.id];
	if (!saved) return;

	const { roles: savedRoles, hadMinorRole } = saved;

	delete roleCache[member.id];
	saveRoleCache();

	setTimeout(async () => {
		try {
			const rolesToRestore = hadMinorRole
				? savedRoles
				: savedRoles.filter(id => id !== '1298143821753745458');

			if (rolesToRestore.length > 0) {
				await member.roles.add(rolesToRestore);
				console.log(`\nRestored roles for ${member.user.tag}`);
			}

			if (!hadMinorRole) {
				if (member.roles.cache.has('1298143821753745458')) {
					await member.roles.remove('1298143821753745458');
				}

				await member.roles.add('1234548930533130413');
			}
		}
		catch (err) {
			console.error(`Error restoring roles for ${member.user.tag}:`, err);
		}
	}, 5000);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	const hadMinorRole = oldMember.roles.cache.has(MINOR_ROLE_ID);
	const hasMinorRoleNow = newMember.roles.cache.has(MINOR_ROLE_ID);

	if (!hadMinorRole && hasMinorRoleNow) {
		if (removedMinorRoleOnce.has(newMember.id)) return;

		try {
			const updatedMember = await newMember.guild.members.fetch(newMember.id);

			if (updatedMember.roles.cache.has(MINOR_ROLE_ID)) {
				await updatedMember.roles.remove(MINOR_ROLE_ID);
				console.log(`\nRemoved minors role from ${updatedMember.user.tag}`);
				removedMinorRoleOnce.add(updatedMember.id);
			}
		}
		catch (err) {
			console.error(`Failed to remove minors role from ${newMember.user.tag}:`, err);
		}
	}
});


client.on('messageCreate', message => {
	if (message.author.bot) return;

	if (
		message.channel.name === 'gooneral-vii' &&
		!message.author.bot
	) {
		currentChance = Math.min(currentChance + 0.0001, maxChance);
	}

	if (message.content.toLowerCase().includes('jomar')) {
		message.channel.send(jomarResponses[Math.floor(Math.random() * jomarResponses.length)]);
	}

	if (message.content.toLowerCase().includes('epstein')) {
		message.channel.send(epsteinMessages[Math.floor(Math.random() * epsteinMessages.length)]);
	}

	if (message.content.toLowerCase().includes('nig')) {
		message.channel.send('https://media.discordapp.net/attachments/1069773581409595482/1075943325842030685/ezgif.com-optimize.gif?ex=6880db8e&is=687f8a0e&hm=74174dae4c52e4a25fa7b56ab498ae96913f2e9f84194c7a423db124e4f190ee&');
	}

	if (message.content.toLowerCase().includes('sponge')) {
		if (Math.random() < 0.25) {
			message.channel.send('https://media.discordapp.net/attachments/1113956422254866482/1117535604071215254/togif-1.gif?ex=688e66a2&is=688d1522&hm=d2e386100c9f53a74fc637bd0dad8911e8c9460d51fd2e958d8b11de6779fb42&');
		}
	}

	if (message.content.toLowerCase().includes('fag')) {
		if (Math.random() < 0.25) {
			message.channel.send('https://cdn.discordapp.com/attachments/1148765358245806142/1255546535266095105/IMG_2981.jpg?ex=68712ed4&is=686fdd54&hm=03c3da21d686de752828183b2747e1c95cd830e4fd2497e0610c7dd6dd9923d6&');
		}
	}

	// eslint-disable-next-line no-inline-comments
	if (message.author.id === '827174001049862164') { // this is jomar's user id
		message.author.send('<@827174001049862164> ' + harassment[Math.floor(Math.random() * harassment.length)]).catch(console.error);
	}
});

client.login(token);
