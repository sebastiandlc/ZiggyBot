// node-fetch 3.0 can't be imported with require as it is an ESM-only module. To
// load it, we'll use the wrapper function outlined in the node-fetch README
// found at https://github.com/node-fetch/node-fetch/blob/main/README.md#loading-and-configuring-the-module
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { OW_TOKEN } = require('../constants.js');

const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N", ""];
const emojis = ["", "", ":thunder_cloud_rain:", ":cloud_rain:", "", ":cloud_rain:", ":snowflake:", ":fog:", ":cloud:"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the current weather conditions for a given zipcode.')
        // Build subcommand for 7-day forecast
        .addSubcommand(subcommand =>
            subcommand
              .setName('5-day')
              .setDescription('Get a 5 day forecast.')
              .addIntegerOption(option =>
                  option.setName('zipcode')
                      .setDescription('Input a 5-digit zipcode')
                      .setRequired(true)))
        // Build subcommand for hourly forecast
        .addSubcommand(subcommand =>
            subcommand
              .setName('hourly')
              .setDescription('Get an hourly weather forecast.')
              .addIntegerOption(option =>
                  option.setName('zipcode')
                      .setDescription('Input a 5-digit zipcode')
                      .setRequired(true)))
        // Build subcommand for current weather data
        .addSubcommand(subcommand =>
            subcommand
              .setName('current')
              .setDescription('Get info about current weather conditions.')
              .addIntegerOption(option =>
                  option.setName('zipcode')
                      .setDescription('Input a 5-digit zipcode')
                      .setRequired(true))),
    async execute(interaction) {
        try {
            const zipString = interaction.options.getInteger('zipcode').toString();

            // Add a check to ensure zipcode is valid
            if (zipString.length != 5) {
                await interaction.reply('Please enter a 5 digit zipcode!');
                return;
            }

            // Defer our reply while we wait on data fetch
            await interaction.deferReply();


            // Change subcommand check from if-else to switch statement
            // Determine subcommand and execute
            if (interaction.options.getSubcommand() === '5-day') {
                let emojiArr = [], descriptions = [], rainOdds = [], minTemps = [], maxTemps = [];
                let currentdate, daysIndex;

                // Get coordinate and location name info
                const { coord, weather, name } = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipString},us&units=imperial&mode=json&appid=${OW_TOKEN}`)
                    .then(response => response.json())
                    .catch(error => {
                        interaction.editReply('There was an error');
                    });

                // Use coorindate data to get forecast data
                const { daily } = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${OW_TOKEN}`)
                    .then(response => response.json())
                    .catch(error => {
                        interaction.editReply('There was an error');
                    });

                // Determine current weekday
                currentDate = new Date(daily[0].dt * 1000);
                daysIndex = days.indexOf(currentDate.toLocaleString("en-US", {weekday: "long"}));

                // Set values
                for (let i = 0; i < 5; i++) {
                    let weatherId = daily[i].weather[0].id;

                    // 800 is for clear sky, 80x is for clouds
                    if (weatherId === 800)
                        emojiArr.push(":sunny:");
                    else
                        emojiArr.push(emojis[Math.floor(weatherId / 100)]);

                    descriptions.push(daily[i].weather[0].description);
                    rainOdds.push(Math.round(daily[i].pop * 100));
                    minTemps.push(Math.round(daily[i].temp.min));
                    maxTemps.push(Math.round(daily[i].temp.max));
                }

                // Build the MessageEmbed
                const forecastEmbed = new MessageEmbed()
                    .setColor('#a37c82')
                    .setAuthor('5-day forecast')
                    .setTitle(`${name}`)
                    .setThumbnail(`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`)
                    .setFooter(`Weather for ${zipString}`)
                    .setTimestamp();

                for (let i = 0; i < 5; i++)
                    forecastEmbed.addFields(
                        { name: `${days[(daysIndex + i) % 7]} ${emojiArr[i]}`, value: `${descriptions[i]}`, inline: true },
                        { name: `\u2800`, value: `:cloud_rain: ${rainOdds[i]}%`, inline: true },
                        { name: `\u2800`, value: `:thermometer: **${maxTemps[i]}** / ${minTemps[i]}°F`, inline: true } );

                interaction.editReply({ embeds: [forecastEmbed] });

            } else if (interaction.options.getSubcommand() === 'hourly') {
                let hourTimes = [], hourTimes24 = [], weatherIcons = [], hourlyDescriptions = [], hourlyTemps = [], hourlyRainOdds = [];
                let tempSRDate, tempSSDate;
                let sunsetHour, sunriseHour;

                // Get coordinate and location name info
                const { coord, weather, sys, name } = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipString},us&units=imperial&mode=json&appid=${OW_TOKEN}`)
                      .then(response => response.json())
                      .catch(error => {
                          interaction.editReply('There was an error');
                      });

                // Use coorindate data to get daily forecast data
                const { hourly } = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&units=imperial&exclude=current,minutely,daily,alerts&appid=${OW_TOKEN}`)
                      .then(response => response.json())
                      .catch(error => {
                          interaction.editReply('There was an error');
                      });

                // Calcualte sunrise/sunset time in 24-hr time for easy comparison later
                tempSRDate = new Date(sys.sunrise * 1000);
                tempSSDate = new Date(sys.sunset * 1000);
                sunriseHour = tempSRDate.toLocaleString("en-US", {hour: "numeric", hour12: false });
                sunsetHour = tempSSDate.toLocaleString("en-US", {hour: "numeric", hour12: false });

                // Set values
                for (let i = 0; i < 8; i++) {
                    let tempDate = new Date(hourly[i].dt * 1000);
                    let weatherId = hourly[i].weather[0].id;

                    hourTimes.push(tempDate.toLocaleString("en-US", {hour: "numeric"}));
                    hourTimes24.push(tempDate.toLocaleString("en-US", {hour: "numeric", hour12: false}));

                    // Populate weather emojis (use different icons for sunrise/sunset/clear skies)
                    if (hourTimes24[i] === sunriseHour) {
                        weatherIcons.push(":sunrise:");

                        // Replace xx AM with xx:xx AM
                        hourTimes[i] = tempSRDate.toLocaleString("en-US", {hour: "numeric", minute: "numeric"});

                    } else if (hourTimes24[i] === sunsetHour) {
                        weatherIcons.push(":city_sunset:");

                        // Replace xx AM with xx:xx PM
                        hourTimes[i] = tempSSDate.toLocaleString("en-US", {hour: "numeric", minute: "numeric"});

                    } else if (weatherId === 800) {
                        if (hourTimes24[i] < sunriseHour)
                            weatherIcons.push(":new_moon:");
                        else if (hourTimes24[i] < sunsetHour)
                            weatherIcons.push(":sunny:");
                        else
                            weatherIcons.push(":new_moon:");
                    } else
                        weatherIcons.push(emojis[Math.floor(weatherId / 100)]);

                    hourlyTemps.push(Math.round(hourly[i].temp));
                    hourlyRainOdds.push(Math.round(hourly[i].pop * 100));
                    hourlyDescriptions.push(hourly[i].weather[0].description);
                }

                // Build the MessageEmbed
                const hourlyForecastEmbed = new MessageEmbed()
                    .setColor('#a37c82')
                    .setAuthor('Hourly forecast')
                    .setTitle(`${name}`)
                    .setThumbnail(`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`)
                    .setFooter(`Weather for ${zipString}`)
                    .setTimestamp();

                for (let i = 0; i < 8; i++)
                    hourlyForecastEmbed.addFields(
                        { name: `${hourTimes[i]} ${weatherIcons[i]}`, value: `${hourlyDescriptions[i]}`, inline: true },
                        { name: `\u2800`, value: `:cloud_rain: ${hourlyRainOdds[i]}%`, inline: true },
                        { name: `\u2800`, value: `:thermometer: ${hourlyTemps[i]}°F`, inline: true } );

                interaction.editReply({ embeds: [hourlyForecastEmbed] });

            } else if (interaction.options.getSubcommand() === 'current') {
                let degCelsius, rainFall = 0, windSpeed = 0, directionsIndex = 17;
                let sunriseDate, sunriseHr, srHr, sunriseMin;
                let sunsetDate, sunsetHr, ssHr, sunsetMin;

                // Get weather data
                const { weather, main, wind, rain, sys, timezone, name } = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipString},us&units=imperial&mode=json&appid=${OW_TOKEN}`)
                      .then(response => response.json())
                      .catch(error => {
                            interaction.editReply('There was an error');
                      });

                // Set values
                degCelsius = Math.round((main.temp - 32) * (5 / 9));

                if (wind) {
                    windSpeed = Math.round(wind.speed);

                    if (wind.deg > 0)
                        directionsIndex = Math.round(wind.deg / 22.5);
                }

                // Testing this
                if (rain) {
                    console.log(rain);
                    console.log(`Rainfall value is ${rain["1h"]}`);
                }

                // Calculate sunrise and sunset times
                sunriseDate = new Date(sys.sunrise * 1000);
                srHr = sunriseDate.toLocaleString("en-US", {hour: "numeric"});
                sunriseHr = srHr.split(' ');
                sunriseMin = sunriseDate.toLocaleString("en-US", {minute: "numeric"});

                sunsetDate = new Date(sys.sunset * 1000);
                ssHr = sunsetDate.toLocaleString("en-US", {hour: "numeric"});
                sunsetHr = ssHr.split(' ');
                sunsetMin = sunsetDate.toLocaleString("en-US", {minute: "numeric"});

                // Build the MessageEmbed
                const weatherEmbed = new MessageEmbed()
                    .setColor('#a37c82')
                    .setThumbnail(`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`)
                    .addFields(
                        { name: `**${name}** :flag_${sys.country.toLowerCase()}:`, value: `:mega: Today: ${weather[0].description} currently. It's ${parseInt(main.temp)}°; it feels like ${parseInt(main.feels_like)}°.`},
                        { name: '**Temperature**', value: `:thermometer: ${parseInt(main.temp)}°F (${degCelsius}°C)`, inline: true },
                        { name: '**Sunrise**', value: `:sunrise_over_mountains: ${sunriseHr[0]}:${sunriseMin}${sunriseHr[1]}`, inline: true },
                        { name: '**Sunset**', value: `:city_sunset: ${sunsetHr[0]}:${sunsetMin}${sunsetHr[1]}`, inline: true },
                        { name: '**Humidity**', value: `:droplet: ${main.humidity}%`, inline: true },
                        { name: '**Wind**', value: `:dash: ${windSpeed} mph ${directions[directionsIndex]}`, inline: true },
                        { name: '**Precipitation**', value: `:cloud_rain: ${rainFall}mm over past hr`, inline: true })
                    .setFooter(`Weather for ${zipString}`)
                    .setTimestamp();

                interaction.editReply({ embeds: [weatherEmbed] });
            }
        } catch (error) {
            console.error(error);
        }
    },
};
