const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletemsgs')
        .setDescription('Delete the last [2, 25] msgs from the current channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('amount to delete')
                .setRequired(true)),
    async execute(interaction) {
        try {
            let amount = interaction.options.getInteger('amount');

            // Ensure only [2, 25] messages are allowed to be deleted
            if (amount < 2 || amount > 25)
                await interaction.reply({ content: 'Please enter a value between 2 and 25.', ephemeral: true});

            // Ensure caller has permission to delete messages
            if (!interaction.member.permissions.has('MANAGE_MESSAGES'))
                await interaction.reply({ content: 'You do not have permission to manage messages in this channel.', ephemeral: true});

            await interaction.channel.bulkDelete(amount).then(() =>
                interaction.reply({ content: `Successfully deleted ${amount} messages!`, ephemeral: true})
            );
        } catch (error) {
            console.log(`Unable to delete messages in #${interaction.channel.name} (${error}).`);
        }
    },
};
