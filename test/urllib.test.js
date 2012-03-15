/**
 * Module dependencies.
 */

var urllib = require('../lib/urllib');
var should = require('../node_modules/should');
var http = require('http');

describe('urllib', function() {
  var mapping = [ 
    [ 'http://www.baidu.com/', 'http://www.baidu.com/' ],
    [ 'http://t.cn/StVkqS', 'http://nodejs.org/community/' ],
    [ 'http://url.cn/48JGfK', 'http://baike.baidu.com/view/6341048.htm' ],
    [ 'http://t.cn/aK1IFu', 'http://v.youku.com/v_show/id_XMjc2MjY1NjEy.html' ],
    [ 'http://url.cn/3OMI3O', 'http://v.youku.com/v_show/id_XMjc2MjY1NjEy.html', 2 ], // 2 times redirect
    [ 'http://luo.bo/17221/', 'http://luo.bo/17221/' ],
    [ 'http://t.itc.cn/LLHD6', 'http://app.chrome.csdn.net/work_detail.php?id=57' ],
  ];
  
  describe('#expand()', function() {
    var desc = 'should expand ' + mapping.length + ' shorten urls success';
    // it(desc, function(done) {
    //   var counter = 0;
    //   mapping.forEach(function(map) {
    //     urllib.expand(map[0], function(err, longurl, redirectCounter) {
    //       should.not.exist(err);
    //       longurl.should.equal(map[1]);
    //       if (map[2]) {
    //         redirectCounter.should.equal(map[2]);
    //       }
    //       if (++counter === mapping.length) {
    //         done();
    //       }
    //     })
    //   })
    // });

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