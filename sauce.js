const path = require('path');
const fs = require('fs');
const { Client } = require('discord.js');
const discordClient = new Client();
const commandsMap = new Map();

const config = (() => {
  if (!fs.existsSync('config.json')) {
    console.error(`There is an error with the config file.`);
    process.exit(1);
  }
  let json;
  try {
    json = JSON.parse(fs.readFileSync('config.json').toString());
  } catch (error) {
    console.error(`Couldn't load/parse the config file`);
    process.exit(1);
  }
  if (json.token && !/^[a-zA-Z0-9_\.\-]{59}$/.test(json.token)) {
    console.error(`Please fill out the token in config file.`);
  }
  return json;
})();

discordClient.config = config;
discordClient.commands = commandsMap;

fs.readdirSync(path.resolve(__dirname, 'commands'))
  .filter(f => f.endsWith('.js'))
  .forEach(f => {
    console.log(`Loading command ${f}`);
    try {
      let command = require(`./commands/${f}`);
      if (typeof command.run !== 'function') {
        throw 'Command is missing a run function!';
      }
      else if (!command.help || !command.help.name) {
        throw 'Command is missing a valid help object!';
      }
      commandsMap.set(command.help.name, command);
    }
    catch (error) {
      console.error(`Couldn't load command ${f}: ${error}`);
    }
  });

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag} (ID: ${discordClient.user.id})!`);
  discordClient.generateInvite([
    'SEND_MESSAGES',
    'MANAGE_MESSAGES',
  ]).then(invite => {
    console.log(`Click here to invite the bot to your server:\n${invite}`);
  });
});

discordClient.on('message', message => {
  if (message.author.bot || !message.guild) {
    return;
  }
  let { content } = message;
  if (!content.startsWith(config.prefix)) {
    return;
  }
  let split = content.substr(config.prefix.length).split(' ');
  let label = split[0];
  let args = split.slice(1);
  if (commandsMap.get(label)) {
    commandsMap.get(label).run(discordClient, message, args);
  }
});

config.token && discordClient.login(config.token);
