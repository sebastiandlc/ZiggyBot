const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Start a vote for the people!')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('How long to let the vote run for in minutes (from 1-5)')
                .setRequired(true))
        .addStringOption(option => option.setName('option_1').setDescription('Option 1').setRequired(true))
        .addStringOption(option => option.setName('option_2').setDescription('Option 2').setRequired(true))
        .addStringOption(option => option.setName('option_3').setDescription('Option 3'))
        .addStringOption(option => option.setName('option_4').setDescription('Option 4')),
    time: 0,
    async execute(interaction) {
        let numOptions = 0;
        let optionsListString = '';
        time = interaction.options.getInteger('time');
        const optionEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

        if (time < 1 || time > 5) {
            await interaciton.reply({ content: 'Please enter a time between 1 and 5!', ephemeral: true});
        }

        for (let i = 1; i < 5; i++) {
            if (interaction.options.getString(`option_${i}`)) {
                console.log('found option to add to vote list');
                optionsListString += `${optionEmojis[i - 1]} ${interaction.options.getString(`option_${i}`)}\n`;
                numOptions++;
            }
        }


        // Reply with initial message announcing vote and add initial reactions.
        const message = await interaction.reply({ content: `${interaction.user} has started a vote! React with an option below to participate! (${time}m)\n${optionsListString}`, fetchReply: true });

        try {
            for (let i = 0; i < numOptions; i++) {
                await message.react(`${optionEmojis[i]}`);
            }
        } catch (error) {
            console.error('One of the emojis failed to react:', error);
        }
    },
    getTime() {
        return time;
    }
}
