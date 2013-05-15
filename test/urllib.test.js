/**
 * Module dependencies.
 */

var urllib = require('../lib/urllib');
var should = require('should');
var http = require('http');
var pedding = require('pedding');


describe('urllib.test.js', function() {
  
  describe('expand()', function () {
    var mapping = [ 
      [ 'http://www.baidu.com/', 'http://www.baidu.com/', 0 ],
      [ 'http://163.fm/7yYSdlI', 'http://nodejs.org/community/', 2 ],
      [ 'http://t.cn/zlFTepd', 'http://w775.51qiangzuo.com/', 1 ],
      // [ 'http://luo.bo/17221/', 'http://luo.bo/17221/', 0 ],
      // [ 'http://t.itc.cn/LLHD6', 'http://app.chrome.csdn.net/work_detail.php?id=57', 1 ],
    ];
    var desc = 'should expand ' + mapping.length + ' shorten urls success';

    it(desc, function (done) {
      var counter = 0;
      mapping.forEach(function (map) {
        urllib.expand(map[0], function (err, longurl, redirectCounter) {
          should.not.exist(err);
          longurl.should.equal(map[1]);
          redirectCounter.should.equal(map[2]);
          if (++counter === mapping.length) {
            done();
          }
        })
      })
    });

    it(desc + ' with pedding', function (done) {
      done = pedding(mapping.length, done);
      mapping.forEach(function (map) {
        urllib.expand(map[0], function (err, longurl, redirectCounter) {
          should.not.exist(err);
          longurl.should.equal(map[1]);
          redirectCounter.should.equal(map[2]);
          done();
        })
      })
    });

    it('should return empty string when shorturl set wrong', function(done) {
      urllib.expand('', function(err, longurl) {
        should.not.exist(err);
        should.not.exist(longurl);
        done();
      })
    });

    it('should throw error when pass null', function() {
      try {
        urllib.expand();
      } catch(e) {
        e.name.should.equal('TypeError');
        e.message.should.equal('undefined is not a function');
      }
      (function() {
        urllib.expand();
      }).should.throw();
      (function() {
        urllib.expand(null);
      }).should.throw();
    });
  });

  describe('#expand() server Error', function() {
    var app = http.createServer(function(req, res) {
      res.destroy();
    });

    before(function(done) {
      app.listen(0, done);
    });

    it('should return error when target url server error', function(done) {
      var url = 'http://localhost:' + app.address().port + '/foo';
      urllib.expand(url, function(err, longurl) {
        should.exist(err);
        err.should.be.an.instanceof(Error);
        err.message.should.equal('connect ECONNREFUSED');
        done();
      });
    });
  });
});
