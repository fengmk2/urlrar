/**
 * Module dependencies.
 */

 var http = require('http');
 var https = require('https');
 var parse = require('url').parse;

/**
 * Max auto redirect, default is 5
 */

exports.maxRedirect = 5;

/**
 * Expand a shorten url
 */

exports.expand = function(url, callback) {
  var info = parse(url || '')
  if (!info.hostname) {
    return callback();
  }
  var options = {
    hostname: info.hostname,
    path: info.path,
    method: 'HEAD'
  };
  if (callback.__redirectCounter === undefined) {
    callback.__redirectCounter = 0;
  }
  var request = http.request;
  if (info.protocol === 'https:') {
    request = https.request;
  }
  var req = request(options);
  req.on('error', function(err) {
    callback(err, url, callback.__redirectCounter);
  });
  req.on('response', function(res) {
    if (res.statusCode === 302 || res.statusCode === 301) {
      var location = res.headers['location'];
      if (++callback.__redirectCounter > exports.maxRedirect) {
        return callback(null, location, callback.__redirectCounter);
      }
      return exports.expand(location, callback);
    }
    callback(null, url, callback.__redirectCounter);
  });
  req.end();
};