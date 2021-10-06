// node-fetch 3.0 can't be imported with require as it is an ESM-only module. To
// load it, we'll use the wrapper function outlined in the node-fetch README
// found at https://github.com/node-fetch/node-fetch/blob/main/README.md#loading-and-configuring-the-module
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { SlashCommandBuilder } = require('@discordjs/builders');
const { SP_TOKEN } = require('../constants.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strawpoll')
        .setDescription('Create a straw poll.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('What should this straw poll address?')
                .setRequired(true))
            .addStringOption(option => option.setName('option_1').setDescription('Option 1').setRequired(true))
            .addStringOption(option => option.setName('option_2').setDescription('Option 2').setRequired(true))
            .addStringOption(option => option.setName('option_3').setDescription('Option 3'))
            .addStringOption(option => option.setName('option_4').setDescription('Option 4'))
            .addStringOption(option => option.setName('option_5').setDescription('Option 5')),
    async execute(interaction) {
        try {
            let pollAnswers = [];

            // Populate pollAnswers
            for (let i = 1; i < 6; i++) {
                let currentOption = interaction.options.getString(`option_${i}`);

                if (currentOption)
                    pollAnswers.push(currentOption);
            }

            const pollInfo =
            {
                "poll": {
                    "title": `${interaction.options.getString('prompt')}`,
                    "answers": pollAnswers
                }
            };

            // POST create poll
            const response = await fetch('https://strawpoll.com/api/poll/',
            {
                method: 'POST',
                body: JSON.stringify(pollInfo),
                headers: {
                    'Content-Type': 'application/json',
                    'API-KEY': SP_TOKEN
                }
            })
            .catch((error) => {
                console.error(error);
            });
            const data = await response.json();
            await interaction.reply(`${interaction.user.username} has started a strawpoll! https://strawpoll.com/${data.content_id}`);

        } catch (error) {
            console.error(error);
        }
    },
};
