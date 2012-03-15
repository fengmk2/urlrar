/**
 * Module dependencies.
 */
 
var app = require('../app');

describe('app', function() {
  before(function(done) {
    app.listen(0, done);
  });

  it('GET / should show the title, a form and a text input', function(done) {
    app.request().get('/').end(function(res) {
      res.should.status(200);
      res.should.header('X-Power-By', 'Nodejs');
      var body = res.body.toString();
      // 主页面显示介绍和表单
      body.should.include('<title>Shorten URL Expand</title>');
      body.should.include('<form');
      body.should.include('</form>');
      body.should.include('<input');
      done();
    });
  });

  it('GET /api should have an api', function(done) {
    app.request().get('/api').end(function(res) {
      res.should.status(200);
      res.should.header('X-Power-By', 'Nodejs');
      done();
    });
  });

  it('GET /api?u=http://t.cn/StVkqS should worked', function(done) {
    app.request()
    .get('/api?u=http://t.cn/StVkqS')
    .end(function(res) {
      res.should.status(200);
      res.body.toString().should.equal('http://nodejs.org/community/');
      done();
    });
  });

  it('GET /other should not found the page', function(done) {
    app.request().get('/noexists').end(function(res) {
      res.should.status(404);
      res.should.header('X-Power-By', 'Nodejs');
      res.body.toString().should.equal('Page Not Found!');
      done();
    });
  });
});