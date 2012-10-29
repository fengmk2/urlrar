/**
 * Module dependencies.
 */
 
var request = require('supertest');
var app = require('../app');

describe('app.test.js', function () {
  before(function (done) {
    app.listen(0, done);
  });

  it('GET / should show the title, a form and a text input', function (done) {
    request(app)
    .get('/')
    .expect(200)
    .expect('X-Power-By', 'Nodejs')
    .end(function (err, res) {
      var body = res.text;
      // 主页面显示介绍和表单
      body.should.include('<title>Shorten URL Expand</title>');
      body.should.include('<form');
      body.should.include('</form>');
      body.should.include('<input');
      done(err);
    });
  });

  it('GET /api should have an api', function (done) {
    request(app)
    .get('/api')
    .expect(200)
    .expect('X-Power-By', 'Nodejs', done);
  });

  it('GET /api?u=http://t.cn/StVkqS should worked', function (done) {
    request(app)
    .get('/api?u=http://t.cn/StVkqS')
    .expect(200)
    .expect('http://nodejs.org/community/', done);
  });

  it('GET /other should not found the page', function (done) {
    request(app)
    .get('/noexists')
    .expect(404)
    .expect('Page Not Found!', done);
  });
});
