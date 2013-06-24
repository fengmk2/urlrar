# urlrar, Expand any shorten url for you [![Build Status](https://secure.travis-ci.org/fengmk2/urlrar.png?branch=master)](http://travis-ci.org/TBEDP/urllib) [![Coverage Status](https://coveralls.io/repos/fengmk2/urlrar/badge.png)](https://coveralls.io/r/fengmk2/urlrar)

* demo: [Shorten URL Expand](http://urlrar.cnodejs.net/)
* jscoverage: [93%](http://fengmk2.github.com/coverage/urlrar.html)

## API

### Expand shorten url

* GET /v1/expand?url=$shorten_url[&fields=url,title,charset,size,icon]

### Error

```js
// HTTP Status 500
{
  status: 500,
  type: "HTTPRequestTimeError",
  message: "5000ms request timeout."
}
```

## Start

```bash
$ node server.js
```

## Help

* Twitter: @fengmk2 
* 微博: @Python发烧友

## Deploy

```bash
$ dotcloud push urlrar .
```

## License 

(The MIT License)

Copyright (c) 2012-2013 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
