/*!
 * urlrar
 *
 * Copyright(c) 2011 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http');
var parse = require('url').parse;
var fs = require('fs');
var urllib = require('./lib/urllib');

/**
 * Load home page html
 */

var homeHtml = fs.readFileSync('./index.html');

/**
 * Main app
 */

var app = http.createServer(function(req, res) {
  res.setHeader('X-Power-By', 'Nodejs');
  var info = parse(req.url, true);

  if (info.pathname === '/') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(homeHtml);
  }

  if (info.pathname === '/api' || info.pathname === '/api/e') {
    var query = info.query;
    if (!query.u) {
      return res.end('`u` argument required.')
    }
    urllib.expand(query.u, function(err, longurl) {
      if (query.cb) {
        longurl = query.cb + '(' + JSON.stringify(longurl) + ')';
      }
      res.end(longurl);
    });
    return;
  }

  res.statusCode = 404;
  res.end('Page Not Found!'); 
});

module.exports = app;