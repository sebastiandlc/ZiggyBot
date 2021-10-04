// These 2 lines are required when running outside of a container
const dotenv = require('dotenv');
dotenv.config();

//const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { TOKEN } = require('./constants.js');

const wait = require('util').promisify(setTimeout);
const fs = require('fs');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Create an array of .js command file names in /cmds
client.commands = new Collection();
const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));


// Populate client.commands with commands from commandFiles
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// Event listeners
for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


// Call a command's execute() if it is a valid command
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Execute the command
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
    }

    // If the command has a deferred follow-up message, handle it here
    // TODO: add counter to tally votes and give follow up message with result
    if (interaction.commandName === 'vote') {
        console.log(`time to wait: ${command.getTime()}m.`);
        //await wait(60000 * ${command.getTime()});


        await interaction.followUp('Voting is over!');
    }
});

// Login to Discord using client token
client.login(TOKEN);
