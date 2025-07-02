// Commands/Utility/wisdom.js

const { SlashCommandBuilder } = require('discord.js');

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const responses = [
	'Obamas wind turbines kill 13-39 million birds and bats every year!',
	'Crazy Joe Biden is trying to act like a tough guy. Actually, he is weak, both mentally and physically, and yet he threatens me, for the second time, with physical assault. He doesnt know me, but he would go down fast and hard, crying all the way.',
	'NEVER, EVER THREATEN THE UNITED STATES AGAIN OR YOU WILL SUFFER CONSEQUENCES THE LIKES OF WHICH FEW THROUGHOUT HISTORY HAVE EVER SUFFERED BEFORE. WE ARE NO LONGER A COUNTRY THAT WILL STAND FOR YOUR DEMENTED WORDS OF VIOLENCE & DEATH. BE CAUTIOUS!',
	'Many people say that it is Patriotic to wear a face mask when you cant socially distance. There is nobody more Patriotic than me, your favorite President!',
	'Nobodys ever been treated badly like me... Although they do say Abraham Lincoln was treated really badly.',
	'I havent actually left the White House in months.',
	'I had a meeting at the Pentagon with lots of generals ... they were like from a movie, better looking than Tom Cruise and stronger. And I had more generals than ive ever seen."',
	'Why cant we use nuclear weapons?',
	'Its freezing and snowing in New York - we need global warming!',
	'Sorry, losers. My IQ is the highest and you all know it.',
	'I have a great relationship with the blacks.',
	'My fingers are long and beautiful, as are various other parts of my body.',
	'The beauty of me is that im very rich.',
	'I wouldnt say im a feminist. I think that would be, maybe, going too far.',
	'Im an environmentalist. A lot of people dont understand that. I think I know more about the environment than most people.',
	'When during the campaign I would say, "Mexico" is going to pay for the wall, obviously I never said this and I never meant theyre going to write out a cheque.',
	'Why would Kim Jong-un insult me by calling me old, when I would never call him short and fat? Oh well, I try so hard to be his friend and maybe someday that will happen.',
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wisdom')
		.setDescription('Get some wisdom from the one and only Donald J. Trump.'),
	async execute(interaction) {
		await interaction.reply(responses[getRandomInt(1, responses.length)]);
	},
};
