// These 2 lines are required when running outside of a container
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, TOKEN } = require('./constants.js');

const commands = [];
const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));


// Push new commands to commands array with JSON data
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);
    commands.push(command.data.toJSON());
}

console.log('successfully pushed new commands');

// Register commands to the server
const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
    try {
		    console.log('Refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
