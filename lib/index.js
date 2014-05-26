
/**
 * Module dependencies.
 */

var superagent = require('superagent');
var random = require('pickrand');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * A way to interact with the Google Images API.
 *
 * @return {Function}
 */

function plugin() {
  return function(robot){
    robot.help([
      'image me <query>',
      'animate me <query>'
    ], '<query> google images and return random top result');

    robot.on('mention', /(?:image|img)(?: me)? (.*)/i, function(res){
      get(res[1], false, function(err, url){
        err
          ? res.error(err)
          : res.say(url);
      });
    });

    robot.on('mention', /animate(?: me)? (.*)/i, function(res){
      get(res[1], true, function(err, url){
        err
          ? res.error(err)
          : res.say(url);
      });
    });
  };
}

/**
 * Get image from google.
 *
 * @param {String} query
 * @param {Boolean} animated
 * @param {Function} fn
 * @api private
 */

function get(query, animated, fn){
  var q = {
    v: '1.0',
    rsz: '8',
    q: query,
    safe: 'active'
  };

  if (animated) q.imgtype = 'animated';

  superagent
    .get('http://ajax.googleapis.com/ajax/services/search/images')
    .query(q)
    .end(function(err, res){
      if (err) return fn(err);
      res.body = JSON.parse(res.text);
      var images = res.body.responseData && res.body.responseData.results;
      if (!images || 0 === images.length) return fn('No images found.');
      var img = random(images);
      fn(null, img.unescapedUrl + '#.png');
    });
}