const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a small poll with up to 4 options.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('What pressing topic should this poll address?')
                .setRequired(true))
        .addStringOption(option => option.setName('option_1').setDescription('Option 1').setRequired(true))
        .addStringOption(option => option.setName('option_2').setDescription('Option 2').setRequired(true))
        .addStringOption(option => option.setName('option_3').setDescription('Option 3'))
        .addStringOption(option => option.setName('option_4').setDescription('Option 4')),
    async execute(interaction) {
        let numOptions = 0;
        let optionsListString = '';
        const optionEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

        // Populate poll message content
        for (let i = 1; i < 5; i++)
            if (interaction.options.getString(`option_${i}`)) {
                optionsListString += `${optionEmojis[i - 1]} ${interaction.options.getString(`option_${i}`)}\n`;
                numOptions++;
            }

        try {
            // Build the MessageEmbed
            const pollEmbed = new MessageEmbed()
                .setColor('#a2d4df')
                .setAuthor(`${interaction.user.username} has started a poll!`, 'https://i.imgur.com/5v1tiLI.png')
                .setTitle(`${interaction.options.getString('question')}`)
                .setThumbnail('https://i.imgur.com/5v1tiLI.png')
                .setDescription(`${optionsListString}`)
                .setTimestamp();

            const message = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

            // Add the initial reactions to the poll message in order
            for (let i = 0; i < numOptions; i++)
                await message.react(`${optionEmojis[i]}`);

        } catch (error) {
            console.error(error);
        }
    },
};
