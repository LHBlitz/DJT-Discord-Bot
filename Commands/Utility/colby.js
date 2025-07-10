const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const activeSpamJobs = new Map();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('colbykennethanderson')
		.setDescription('Donny dont like this dem.')
		.addUserOption(option =>
			option.setName('future_deportee')
				.setDescription('user to spam')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('pings_per_message')
				.setDescription('how many pings in each message')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('message_count')
				.setDescription('how many messages to send')
				.setRequired(true)),

	async execute(interaction) {
		if (global.commandLock) {
			return interaction.reply({
				content: 'command is already running',
				flags: MessageFlags.Ephemeral,
			});
		}

		global.commandLock = true;

		try {
			const target = interaction.options.getUser('future_deportee');
			const pingsPerMessage = interaction.options.getInteger('pings_per_message');
			const messageCount = interaction.options.getInteger('message_count');

			if (pingsPerMessage > 75 || messageCount > 50) {
				return interaction.reply({
					content: 'cap is 75 pings/message and 50 messages total',
					flags: MessageFlags.Ephemeral,
				});
			}

			const mention = `<@${target.id}>`;
			const delayMs = 1;
			const channel = interaction.channel;

			const job = { cancel: false };
			activeSpamJobs.set(channel.id, job);

			await interaction.reply(`GET OUT OF MY COUNTRY ${mention}`);

			const messageListener = (message) => {
				if (
					message.channel.id === channel.id &&
					message.mentions.users.has(target.id) &&
					message.author.id !== interaction.client.user.id
				) {
					job.cancel = true;
				}
			};

			interaction.client.on('messageCreate', messageListener);

			for (let i = 0; i < messageCount; i++) {
				if (job.cancel) break;

				const batch = Array(pingsPerMessage).fill(mention).join(' ');
				await channel.send(batch);
				await new Promise(resolve => setTimeout(resolve, delayMs));
			}

			interaction.client.off('messageCreate', messageListener);
			activeSpamJobs.delete(channel.id);

			if (job.cancel) {
				await interaction.followUp({
					content: 'oh- donny will stop then.... i didnt know you wanted them around...💔💔💔',
					flags: MessageFlags.Ephemeral,
				});
			}
			else {
				await interaction.followUp('Hopefully that will teach them a lesson');
			}
		}
		catch (err) {
			console.error('Error in colby command:', err);
			await interaction.followUp({
				content: 'Donny couldnt do nun this time',
				flags: MessageFlags.Ephemeral,
			});
		}
		finally {
			global.commandLock = false;
		}
	},
};
