// node-fetch 3.0 can't be imported with require as it is an ESM-only module. To
// load it, we'll use the wrapper function outlined in the node-fetch README
// found at https://github.com/node-fetch/node-fetch/blob/main/README.md#loading-and-configuring-the-module
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Fetch a random cat image!'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
            interaction.editReply(file);
            console.log(file);

        } catch (error) {
            console.error(error);
        }
    },
};
