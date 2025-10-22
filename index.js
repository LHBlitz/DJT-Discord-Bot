// index.js

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ActivityType, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const { jomarResponses, harassment, randomMessages, epsteinMessages, statuses } = require('./responses.js');
const AdminCore = require('./admincore');

const ROLE_CACHE = './rolecache.json';

const MINORS_ROLE_ID = '1298143821753745458';
const ADULT_ROLE_ID = '1234548930533130413';

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
        GatewayIntentBits.GuildVoiceStates,
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

function setRandomStatus(cli, chance) {
    if (Math.random() <= chance) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        cli.user.setActivity(status.name, { type: ActivityType[status.type] });
        console.log(`status updated to: ${status.name}`);
    }
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	AdminCore.logEvent('BOT_START', `${readyClient.user.tag} is online`);

	// === Automatic JSON Backups ===
	const xpPath = path.join(__dirname, 'data', 'xp.json');
	const levelsPath = path.join(__dirname, 'data', 'levels.json');
	AdminCore.startAutoBackup(xpPath, 60); // every 60 min
	AdminCore.startAutoBackup(levelsPath, 60);

	// --- Random messages interval ---
	setInterval(() => {
		if (Math.random() < currentChance) {
			const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

			const targetChannel = client.channels.cache.find(
				channel => channel.name === 'gooneral-vii' && channel.isTextBased?.(),
			);

			if (targetChannel) {
				targetChannel.send(randomMessage).catch(console.error);
				AdminCore.logEvent('RANDOM_MESSAGE', `Sent message in #${targetChannel.name}`);
			} else {
				console.log('No target channel found for random message.');
			}
			currentChance = baseChance;
		}
	}, 0.5 * 60 * 1000);

	// --- Status initialization ---
	setRandomStatus(client, 4);
	setInterval(() => {
		setRandomStatus(client, 1.0);
	}, 5 * 60 * 1000);

	// --- Startup log message ---
	const logChannel = client.channels.cache.find(
		channel => channel.name === 'trump-osc' && channel.isTextBased?.(),
	);

	if (logChannel) {
		logChannel.send('We will make Discord strong again. We will make Discord safe again. And we will make Discord great again, greater than ever before.');
		AdminCore.logEvent('STARTUP_MESSAGE', `Sent startup message in #${logChannel.name}`);
	} else {
		console.log('No log channel found. Skipping startup message.');
	}

	// --- Error Watchdog ---
	require('./errorping')(
    	client,
    	'692221013995552838',       // <-- Discord user ID
    	'1374873902437761086'       // <-- channel ID
	);

	// --- Level System ---
	require('./levelsystem')(client);

	// --- AP Politics RSS Feed Integration ---
    require('./appolitics')(
        client,
        '1382884586790326353', // The Discord channel ID you want to post articles in
        'https://rss.app/feeds/3Essj64wzoR5XxIy.xml' // RSS feed URL
    );

	AdminCore.sendAlert(client, 'Bot Online', `${readyClient.user.tag} is now active and monitoring the server.`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (global.commandLock) {
		return interaction.reply({
			content: 'Try again later! I\'m too busy sending Israel more money right now (error)',
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
		AdminCore.logEvent('COMMAND', `${interaction.user.tag} executed /${interaction.commandName}`);
	} catch (error) {
		console.error(error);
		AdminCore.logEvent('ERROR', `${interaction.commandName} failed for ${interaction.user.tag}: ${error.message}`);
		await interaction.reply({ content: 'Try again later! I\'m too busy sending Israel more money right now (error)', flags: MessageFlags.Ephemeral }).catch(() => {});
	}
});

client.on('guildMemberRemove', (member) => {
    const roleIds = member.roles.cache
        .filter(role => !role.managed && role.id !== member.guild.id)
        .map(role => role.id);

    if (roleIds.length > 0) {
        roleCache[member.id] = {
            roles: roleIds,
            hadMinorRole: roleIds.includes(MINORS_ROLE_ID),
            nickname: member.nickname || null,
        };
        saveRoleCache();
        AdminCore.logEvent('MEMBER_LEAVE', `${member.user.tag} left the server.`);
    }
});

client.on('guildMemberAdd', async (member) => {
	const saved = roleCache[member.id];
	const hadMinorRole = saved?.hadMinorRole ?? true;

	if (saved) {
		delete roleCache[member.id];
		saveRoleCache();
	}

	setTimeout(async () => {
		try {
			const rolesToRestore = saved?.roles?.filter(id => id !== MINORS_ROLE_ID && id !== ADULT_ROLE_ID) || [];

			if (rolesToRestore.length > 0) {
				await member.roles.add(rolesToRestore);
				console.log(`\nRestored roles for ${member.user.tag}`);
				AdminCore.logEvent('ROLE_RESTORE', `Restored ${rolesToRestore.length} roles for ${member.user.tag}`);
			}

			if (hadMinorRole) {
				await member.roles.add(MINORS_ROLE_ID).catch(() => {});
				await member.roles.remove(ADULT_ROLE_ID).catch(() => {});
			} else {
				await member.roles.add(ADULT_ROLE_ID).catch(() => {});
				await member.roles.remove(MINORS_ROLE_ID).catch(() => {});
			}

		    if (saved?.nickname) {
                await member.setNickname(saved.nickname).catch(err => {
                    console.error(`Couldn't restore nickname for ${member.user.tag}:`, err);
                });
            }

			AdminCore.sendAlert(client, 'Member Joined', `${member.user.tag} joined and had their roles restored.`);
		}
		catch (err) {
			console.error(`Error restoring roles for ${member.user.tag}:`, err);
			AdminCore.logEvent('ERROR', `Error restoring ${member.user.tag}: ${err.message}`);
		}
	}, 5000);
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

    if (message.content.toLowerCase().includes('man')) {
		if (Math.random() < 0.10) 
			message.channel.send('https://cdn.discordapp.com/attachments/1372358713360388127/1425176744364609617/p9s1y1krwjtf1.gif');
        }
	
    if (message.content.toLowerCase().includes('n word')) {
		if (Math.random() < 0.25) 
			message.channel.send('“We can’t let people throw around that word. I call it the n-word. There are two n-words, and you cant use either of them.”');
        }

	if (message.content.toLowerCase().includes('fag')) {
        if (Math.random() < 0.25) {
            message.channel.send('https://cdn.discordapp.com/attachments/1148765358245806142/1255546535266095105/IMG_2981.jpg');
        }
    }

	if (message.author.id === '827174001049862164') { 
		message.author.send('<@827174001049862164> ' + harassment[Math.floor(Math.random() * harassment.length)]).catch(console.error);
	}

	if (message.content.toLowerCase().includes('trump commands')) {
		const commandList = Array.from(client.commands.keys())
			.map(name => `• /${name}`)
			.join('\n');

		const embed = new EmbedBuilder()
			.setColor('Red')
			.setTitle('DJT Bot Command List')
			.setDescription(commandList || 'No commands registered.')
			.setFooter({ text: 'See Apps and Commands list for more details.' });

		message.channel.send({ embeds: [embed] }).catch(console.error);
	}
});

client.login(token);