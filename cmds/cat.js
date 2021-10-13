// node-fetch 3.0 can't be imported with require as it is an ESM-only module. To
// load it, we'll use the wrapper function outlined in the node-fetch README
// found at https://github.com/node-fetch/node-fetch/blob/main/README.md#loading-and-configuring-the-module
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { SlashCommandBuilder } = require('@discordjs/builders');
const { IMGUR_CLIENT_ID, IMGUR_ALBUM_HASH } = require('../constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Fetch a random image of one of our cats.'),
    async execute(interaction) {
        try {
            let albumSize, selectedImage;
            await interaction.deferReply();

            // Fetch the imgur album
            const response = await fetch(`https://api.imgur.com/3/album/${IMGUR_ALBUM_HASH}/images`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
                }
            })
            .catch((error) => {
                console.error(error);
            });

            const data = await response.json();

            // Select a random image from the album
            albumSize = data.data.length;
            selectedImage = Math.floor(Math.random() * albumSize);

            // Return the selected image
            console.log(data.data[selectedImage]);
            interaction.editReply(`${data.data[selectedImage].link}`);

        } catch (error) {
            console.error(error);
        }
    },
};
