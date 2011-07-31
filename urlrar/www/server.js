/**
 * Only expand url
 */

var http = require('http')
  , urlutil = require('url')
  , qs = require('querystring')
  , os = require('os');

var success_count = 0, error_count = 0, timeout_count = 0;
// send response to request client
function write_to_response(res, str, content_type, status_code) {
	if(!(str instanceof Buffer) && typeof str !== 'string') {
		str = JSON.stringify(str);
	}
	res.writeHead(status_code || 200, {
		'Content-Type': content_type || 'text/plain'
	});
	res.end(str);
};

function redirect(res, url, status_code) {
	res.writeHead(status_code || 302, {
		'Location': url,
		'Content-Length': 0
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
		write_to_response(res, short_url);
		return;
	}
	var sinaurl_m = SINAURL_RE.exec(short_url);
	var host = null, path = null, port = null;
	if(sinaurl_m){
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
	var timer = null, req = null;
	req = http.get(options, function(response) {
	    clearTimeout(timer);
		if(response.statusCode == 302 || response.statusCode == 301) {
			return expand_url(res, urlutil.resolve(short_url, response.headers.location));
		} else {
		    success_count++;
			if(sinaurl_m) {
				var buffers = [], size = 0;
				response.on('data', function(buffer) {
					buffers.push(buffer);
					size += buffer.length;
				});
				response.on('end', function() {
				    response.destroy();
					var data = new Buffer(size), pos = 0;
					for(var i = 0, len = buffers.length; i < len; i++) {
						buffers[i].copy(data, pos);
						pos += buffers[i].length;
					}
					data = data.toString('utf-8');
					try {
						data = JSON.parse(data);
						data = data.data[sinaurl_m[1]];
					} catch(e) {
						data = {error: e.message, source: data};
					}
					write_to_response(res, data);
				});
			} else {
				response.destroy(); // 断开连接，不再继续下载
				write_to_response(res, {url: short_url});
			}
		}
	}).on('error', function(err) {
	    //console.log(err, timer)
	    console.error(err.stack);
	    clearTimeout(timer);
	    error_count++;
		write_to_response(res, short_url);
	});
	
	// timeout
	timer = setTimeout(function(request) {
	    request.abort();
	    timeout_count++;
	    write_to_response(res, short_url);
	}, 5000, req);
};

var server = http.createServer(function(req, res) {
	var info = urlutil.parse(req.url, true);
	if(info.query && info.query.u) {
		expand_url(res, info.query.u);
	} else if(req.url === '/_monitor') {
	    var mb = 1024 * 1024;
	    var html = 'OS memory total ' + parseInt(os.totalmem() / mb) + 'MB, free ' + parseInt(os.freemem() / mb) + 'MB<br/>Process ';
	    var usage = process.memoryUsage();
	    for(var k in usage) {
	        html += k + ' ' + parseInt(usage[k] / mb) + 'MB, ';
	    }
	    html += '<br/></br>Success: ' + success_count + ' Error: ' + error_count + ' Timeout: ' + timeout_count;
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.end(html);
	} else if(req.url === '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('Usage: <a href="/?u=http://t.cn/aK1IFu">/?u=http://t.cn/htf6yk</a>');
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
    console.log('Got SIGTERM exiting...');
    // do some cleanup here
    process.exit(0);
});

server.listen(port);
