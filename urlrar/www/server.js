/**
 * Only expand url
 */

var http = require('http')
  , urlutil = require('url')
  , qs = require('querystring')
  , os = require('os');

var success_count = 0, request_error_count = 0, json_parse_error_count = 0
  , request_timeout_count = 0, response_timeout_count = 0
  , last_json_parse_errors = [], last_json_parse_errors_index = 0
  , last_request_errors = [], last_request_errors_index = 0;
// send response to request client
function write_to_response(res, str, content_type, status_code) {
	res.writeHead(status_code || 200, {
		'Content-Type': content_type || 'text/plain'
	});
	res.end(JSON.stringify(str));
};

function redirect(res, url, status_code) {
	res.writeHead(status_code || 302, {
		'Location': url
	});
	res.end();
};

/* http://t.sina.com.cn/mblog/sinaurl_info.php?url=h6yl4g
 * 
{"code":"A00006","data":{"h6yl4g":
{"url":"http:\/\/v.youku.com\/v_show\/id_XMjA1NjM2NzEy.html",
"type":"video",
"title":"\u300a\u704c\u7bee\u9ad8\u624b\u300b\u4e3b\u9898\u66f2 \u5362\u5bb6\u5b8f \u5409\u4ed6\u6f14\u594f",
"screen":"http:\/\/g4.ykimg.com\/0100641F464C8B73AFFDB100585F014E67B027-8905-DFC4-FDA2-EEF6EBD34A87",
"flash":"http:\/\/player.youku.com\/player.php\/sid\/XMjA1NjM2NzEy\/v.swf","mp4":"",
"icon":"http:\/\/img.t.sinajs.cn\/t3\/style\/images\/common\/feedvideoplay.gif"}}}
 * 
*/
var SINAURL_RE = /http:\/\/(?:t|sinaurl)\.cn\/(\w+)/i;

function expand_url(res, short_url) {
	var info = urlutil.parse(short_url);
	if(info.protocol != 'http:') { // 无法请求https的url?
		return write_to_response(res, {url: short_url});
	}
	var sinaurl_m = SINAURL_RE.exec(short_url);
	var host = null, path = null, port = null;
	if(sinaurl_m) {
		host = 'weibo.com';
		path = '/mblog/sinaurl_info.php?url=' + sinaurl_m[1];
		port = 80;
	} else {
		path = info.pathname || '/';
		if(info.search) {
			path += info.search;
		}
		host = info.hostname;
		port = info.port || 80;
	}
	var headers = {
		'User-Agent': 'NodejsSpider/1.0'
	};
	var options = {
		host: host,
		port: port,
		path: path,
		headers: headers
	};
	var request_timer = null, req = null;
	// request timeout
	var request_timeout = 5000;
	request_timer = setTimeout(function() {
        req.abort();
        request_timeout_count++;
        write_to_response(res, {url: short_url, error: 'Request Timeout ' + request_timeout + 'ms'});
    }, request_timeout);
	req = http.get(options, function(response) {
	    clearTimeout(request_timer);
		if(response.statusCode == 302 || response.statusCode == 301) {
			return expand_url(res, urlutil.resolve(short_url, response.headers.location));
		}
		
	    if(!sinaurl_m || response.statusCode !== 200) {
	        response.destroy(); // 断开连接，不再继续下载
            success_count++;
            return write_to_response(res, {url: short_url});
	    }
	    
	    // 解析新浪返回结果
	    var response_timeout = 10000;
	    var response_timer = setTimeout(function() {
            response.destroy(); // 断开连接，不再继续下载
            response_timeout_count++;
            write_to_response(res, {url: short_url, error: 'Response Timeout ' + response_timeout + 'ms'});
        }, response_timeout);
        var buffers = [], size = 0;
        response.on('data', function(buffer) {
            buffers.push(buffer);
            size += buffer.length;
        });
        response.on('end', function() {
            clearTimeout(response_timer);
            var data = new Buffer(size), pos = 0;
            for(var i = 0, len = buffers.length; i < len; i++) {
                buffers[i].copy(data, pos);
                pos += buffers[i].length;
            }
            data = data.toString('utf-8');
            try {
                data = JSON.parse(data);
                data = data.data[sinaurl_m[1]];
                success_count++;
            } catch(err) {
                console.error('json parse error: ' + short_url);
                console.error(err.stack);
                json_parse_error_count++;
                data = {error: err.message, source: data, url: short_url};
                last_json_parse_errors[last_json_parse_errors_index] = data;
                if(++last_json_parse_errors_index >= 10) {
                    last_json_parse_errors_index = 0;
                }
            }
            write_to_response(res, data);
        });
	}).on('error', function(err) {
	    // 响应头有错误
	    clearTimeout(request_timer);
	    console.error('request parse error: ' + short_url);
	    console.error(err.stack);
	    request_error_count++;
	    var error = {url: short_url, error: err.message};
	    last_request_errors[last_request_errors_index] = error;
	    if(++last_request_errors_index >= 10) {
	        last_request_errors_index = 0;
	    }
		write_to_response(res, error);
	});
};

var INDEX = '<body style="margin: 30px 0 0 30px;">'
    + '<h1>Shorten URL Expand</h1><form action="/"><label>Enter your shorten url:</label><br/>'
    + '<input id="url" type="text" name="u" style="width: 400px;" /> <button>Expand</button></form>'
    + '<p>API Usage: <br/><br/> HTTP GET <a href="/?u=http://t.cn/aK1IFu">/?u=http://t.cn/htf6yk</a></p>'
    + '<p>CURL Demo: <br/><br/>$ curl http://urlexpand.com/?u=http://t.cn/htf6yk</p>'
    + '<hr/><div>Help: Twitter: <a href="http://twitter.com/fengmk2" target="_blank">@fengmk2</a>, '
    + 'Weibo: <a href="http://weibo.com/imk2" target="_blank">@Python发烧友</a></div>'
    + '<p><a href="/monitor">monitor</a> | <a href="http://github.com/fengmk2/urlrar" target="_blank">Source</a>'
    + ' | Power by <a href="http://nodejs.org" target="_blank">Nodejs</a></p></body>';
var server = http.createServer(function(req, res) {
	var info = urlutil.parse(req.url, true);
	if(info.query && info.query.u) {
		expand_url(res, info.query.u);
	} else if(req.url === '/monitor') {
	    var mb = 1024 * 1024;
	    var html = '<body style="margin: 30px 0 0 30px;">OS memory total ' + parseInt(os.totalmem() / mb) + 'MB, free ' + parseInt(os.freemem() / mb) + 'MB<br/>Process ';
	    var usage = process.memoryUsage();
	    for(var k in usage) {
	        html += k + ' ' + parseInt(usage[k] / mb) + 'MB, ';
	    }
	    html += '<br/></br>Success: ' + success_count + ' Error: ' + request_error_count + ' Timeout: ' + request_timeout_count;
	    for(var i = 0, len = last_request_errors.length; i < len; i++) {
	        var error = last_request_errors[i];
	        html += '<hr/>Last Request Error:<br/>' + error.url + ' : ' + error.error;
	    }
	    for(var i = 0, len = last_json_parse_errors.length; i < len; i++) {
            var error = last_json_parse_errors[i];
	        html += '<hr/>Last JSON Parse Error:<br/>' + error.url + ' : ' + error.error + '<br/>' + error.source;
	    }
	    html += '<br/><br/><a href="/">/index</a></body>';
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.end(html);
	} else if(req.url === '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(INDEX);
	} else {
	    redirect(res, '/');
	}
});

process.on('uncaughtException', function(err) {
	console.error('uncaughtException: !!!!\n' + err.stack);
	//process.exit(0);
});

var port = 8080;
if(process.argv.length > 2) {
	port = parseInt(process.argv[2]);
}

process.on('SIGTERM', function () {
//    console.log('Got SIGTERM exiting...');
    // do some cleanup here
    process.exit(0);
});

server.listen(port);
