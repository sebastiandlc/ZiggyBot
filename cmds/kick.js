const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking this user.')),
    async execute(interaction) {
        try {
            let user = interaction.options.getUser('user')
            let reason = (interaction.options.getString('reason')) ? interaction.options.getString('reason') : '';

            if (!interaction.member.permissions.has('KICK_MEMBERS'))
                await interaction.reply('You do not have permission to kick users.');

            if (user.bot)
                await interaction.reply('You can not kick bots with this command.');

            /* Add ability to give reason for kick */
            await interaction.guild.members.kick(user, reason).then(() =>
                interaction.reply(`${user} has been kicked!`)
            );
        } catch (error) {
            console.log(`Unable to kick user (${error}).`);
        }
    },
};
