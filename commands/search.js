const config = require('../config.json'),
  sagiri = require('sagiri'),
  isImageUrl = require('is-image-url'),
  path = require('path'),
  notSupportedExts = new Set(['gif']),
  search = new sagiri(config.saucenaoAPIKey, {
    numRes: 1
  });

exports.run = (bot, msg, args) => {
  let getSauce = function(image) {
    search.getSauce(image).then(response => {
      let data = response[0];
      console.log(response)
      let results = {
        thumbnail: data.original.header.thumbnail,
        similarity: data.similarity,
        material: data.original.data.material || 'none',
        characters: data.original.data.characters || 'none',
        creator: data.original.data.creator || 'none',
        site: data.site,
        url: data.url
      };
      const minSimilarity = 30;
      if (minSimilarity <= ~~results.similarity) {
        msg.channel.send({
          embed: {
            'title': 'Image sauce',
            'image': {
              url: results.thumbnail
            },
            'fields': [{
              'name': 'Similarity',
              'value': `${results.similarity}%`
            }, {
              'name': 'Material',
              'value': results.material
            }, {
              'name': 'Characters',
              'value': results.characters
            }, {
              'name': 'Creator',
              'value': results.creator
            }, {
              'name': 'Original site',
              'value': `${results.site} - ${results.url}`
            }],
            'color': 0xFA77ED
          }
        });
      } else {
        console.error('No Results found!');
        msg.channel.send('No Results found!');
      }
    }).catch((error) => {
      console.error(error.message);
      error = error.toString();
      if (error.includes('You need an image') || error.includes('Supplied URL is not usable') || error.includes('Error: Got HTML response while expecting JSON')) {
        console.error('API Error!');
        msg.channel.send('API Error!');
        return;
      }
    });
  };
  if (!msg.attachments.array()[0] && !args[0]) {
    console.error('Image attachment/URL not found!');
    msg.channel.send('Please add an image, or image URL!');
  } else if (msg.attachments.array()[0]) {
    console.log('Supported image attachment found!');
    if (isImageUrl(msg.attachments.array()[0].url) && !notSupportedExts.has(path.extname(msg.attachments.array()[0].url).slice(1).toLowerCase())) {
      getSauce(msg.attachments.array()[0].url);
    } else {
      console.error('The file/extention is not an image!');
      msg.channel.send('The file/extention is not an image!');
    }
  } else if (isImageUrl(args[0]) && !notSupportedExts.has(path.extname(args[0]).slice(1).toLowerCase())) {
    console.log('Supported image URL found!');
      getSauce(args[0]);
  } else {
    console.error('The file/extention is not an image!');
    msg.channel.send('The file/extention is not an image!');
  }
};
exports.help = {
  name: 'search',
  usage: 'search',
  description: 'Search an image'
};
