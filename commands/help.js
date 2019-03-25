const config = require('../config.json');

exports.run = (bot, msg, args) => {
  msg.channel.send({
    embed: {
      'title': 'Help command',
      'fields': [{
          'name': config.prefix + 'help',
          'value': 'List of all commands.'
        }
      ],
      'color': 3264944,
      'footer': {
        'text': msg + ''
      }
    }
  });
};
exports.help = {
  name: 'help',
  usage: 'help',
  description: 'Help command.'
};
