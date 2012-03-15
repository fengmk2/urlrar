// referer from https://github.com/senchalabs/connect/blob/master/test/support/http.js

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var methods = ['get', 'post', 'put', 'delete', 'head'];
var http = require('http');

module.exports = request;
http.Server.prototype.request = function() {
  return request(this);
}

function request(app) {
  return new Request(app);
}

function Request(app) {
  this.data = [];
  this.header = {};
  this.app = app;
  this.server = app;
  this.addr = this.server.address();
  if (!this.addr) {
    throw new Error('app Must be listen() first');
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(function(method){
  Request.prototype[method] = function(path){
    return this.request(method, path);
  };
});

Request.prototype.set = function(field, val){
  this.header[field] = val;
  return this;
};

Request.prototype.write = function(data){
  this.data.push(data);
  return this;
};

Request.prototype.request = function(method, path){
  this.method = method;
  this.path = path;
  return this;
};

Request.prototype.expect = function(body, fn){
  var args = arguments;
  this.end(function(res) {
    switch (args.length) {
      case 3:
        res.headers.should.have.property(body.toLowerCase(), args[1]);
        args[2]();
        break;
      default:
        if ('number' == typeof body) {
          res.statusCode.should.equal(body);
        } else {
          res.body.should.equal(body);
        }
        fn();
    }
  });
};

Request.prototype.end = function(fn) {
  var self = this;
  var req = http.request({
      method: this.method
    , port: this.addr.port
    , host: this.addr.address
    , path: this.path
    , headers: this.header
  });

  this.data.forEach(function(chunk){
    req.write(chunk);
  });
  
  req.on('response', function(res) {
    var chunks = [], size = 0;
    res.on('data', function(chunk) { 
      chunks.push(chunk); 
      size += chunk.length;
    });
    res.on('end', function() {
      var buf = null;
      switch(chunks.length) {
        case 0: break;
        case 1: buf = chunks[0];break;
        default:
          buf = new Buffer(size);
          var pos = 0;
          for (var i = 0, l = chunks.length; i < l; i++) {
            var chunk = chunks[i];
            chunk.copy(buf, pos);
            pos += chunk.length;
          }
          break;
      }
      res.body = buf;
      fn(res);
    });
  });

  req.end();

  return this;
};