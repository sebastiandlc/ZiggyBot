// node-fetch 3.0 can't be imported with require as it is an ESM-only module. To
// load it, we'll use the wrapper function outlined in the node-fetch README
// found at https://github.com/node-fetch/node-fetch/blob/main/README.md#loading-and-configuring-the-module
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { SlashCommandBuilder } = require('@discordjs/builders');
const { OW_TOKEN } = require('../constants.js');
const { MessageEmbed } = require('discord.js');

// left to do: ability to search by city name, 7-day forecast, add footer for embed
module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the current weather conditions for a given zipcode.')
        // option for 7-day forecast
        // .addSubcommand(subcommand =>
        //     subcommand
        //       .setName('7-day')
        //       .setDescription('Get a 7 day forecast.')
        //       .addIntegerOption(option =>
        //           option.setName('zipcode')
        //               .setDescription('Input a 5-digit zipcode')
        //               .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
              .setName('current')
              .setDescription('Get current weather data.')
              .addIntegerOption(option =>
                  option.setName('zipcode')
                      .setDescription('Input a 5-digit zipcode')
                      .setRequired(true))),
    async execute(interaction) {
        try {
            const zip = interaction.options.getInteger('zipcode');
            const zipString = zip.toString();

            if (zipString.length != 5)
                await interaction.reply('Please enter 5 digit zipcode!');



            // Defer our reply while we wait on API and build the embed.
            await interaction.deferReply();

            //
            if (interaction.options.getSubcommand() === '7-day') {
                //

            } else if (interaction.options.getSubcommand() === 'current') {

                // Fetch the data we'll need to build our MessageEmbed
                // Add check for invalid zipcode input
                const { weather, main, wind, sys, timezone, name } = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipString},us&units=imperial&mode=json&appid=${OW_TOKEN}`)
                      .then(response => response.json())
                      .catch(error => {
                            interaction.editReply('There was an error');
                      });

                // set values from fetch here


                // Build the MessageEmbed
                const weatherEmbed = new MessageEmbed()
                    .setColor('#a37c82')
                    .setTitle(name)
                    //.setDescription() // add short message depending on the temperature
                    .setThumbnail(`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`)
                    .addFields(
                        { name: '**Temperature**', value: `:thermometer: ${parseInt(main.temp)}°F`, inline: true },
                        { name: '**Humidity**', value: `:droplet: ${main.humidity}%`, inline: true },
                        { name: '**Weather Condition**', value: `:mega: ${weather[0].description}`, inline: true },
                        { name: '**Feels Like**', value: `:thermometer: ${parseInt(main.feels_like)}°F`, inline: true },
                        //{ name: '**Sunset**', value: `:sunrise:`, inline: true },
                        { name: '**Wind**', value: `:dash: ${parseInt(wind.gust)} mph`, inline: true })
                        // add wind direction
                    .setTimestamp();


                // Send the finished embed to client
                interaction.editReply({ embeds: [weatherEmbed] });
            }
        } catch (error) {
            console.error(error);
        }
    },
};
