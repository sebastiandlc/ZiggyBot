const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('the input to echo back')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply(interaction.options.getString('input'));
    },
};
