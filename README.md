# About
Ziggy is a WIP Discord bot designed for use in our Discord server. It provides moderation tools and more.

#### Invite Ziggy to your server
  * [put invite link here after switching to global commands]()

## How to Setup

#### Prerequisities

To setup your own bot using this project's code you'll first need to create a Discord bot and install Docker.

**1. Create a Discord Bot**


**2. Install docker**
* https://www.docker.com/products/docker-desktop

**3. Invite the bot to your Discord server**


**4. Create the environment file**
* Create a .env file within the project directory and place your client id, guild id, and token values as such:
```
CLIENT_ID=12345678910
GUILD_ID=1234678910
TOKEN=asedlknfyicq348975rcvdTSDtsvdjdrtcES
OW_TOKEN=dfsklf234nasdf2348asdn234
```

The API key for OpenWeather access is ```OW_TOKEN```, get yours [here](https://openweathermap.org/).

#### Running Locally

This bot runs locally on a host machine within a Docker container, with the ability to be hosted outside of one if desired (*although this requires the latest version of [Node.js](https://nodejs.org/en/)*).

##### Using Docker
Run the command prompt and go to the project's directory. Then use the command:
```
docker compose up
```

If you make any changes to the code, use this command instead:
```
docker compose up --build
```

To kill the container, first use ```Ctrl + C``` to stop the bot, then use ```docker compose down``` to delete the container.

##### Without a Docker Container
If you make any changes to the code, use this command first:
```
node deploy-commands.js
```

Open the command prompt in the project's directory and use the command:
```
node .
```
