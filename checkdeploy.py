#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import urllib2
import simplejson

map = {
   'u0': 'http://85aa419c.dotcloud.com/',
   'u1': 'http://eb35651b.dotcloud.com/',
   'u2': 'http://f66eec2f.dotcloud.com/',
   'u3': 'http://26e0cd1a.dotcloud.com/',
   'u4': 'http://543edf08.dotcloud.com/',
   'u5': 'http://a735c474.dotcloud.com/',
   'u6': 'http://b8d33bf4.dotcloud.com/',
   'u7': 'http://896f6708.dotcloud.com/',
   'u8': 'http://ca8a0316.dotcloud.com/',
   'u9': 'http://1c9ba4e3.dotcloud.com/',
   'u10': 'http://d4f43323.dotcloud.com/',
   'u11': 'http://4adf0b85.dotcloud.com/',
   'u12': 'http://e4374a35.dotcloud.com/',
   'u13': 'http://a489e937.dotcloud.com/',
   'u14': 'http://10e7470e.dotcloud.com/',
   'u15': 'http://29b8be22.dotcloud.com/',
   'u16': 'http://f27e5436.dotcloud.com/',
   'u17': 'http://3591110f.dotcloud.com/',
   'u18': 'http://592e34fa.dotcloud.com/',
   'u19': 'http://4852e608.dotcloud.com/',
   'u20': 'http://7a08bb5c.dotcloud.com/',
}

def check(no):
    url = map['u%s' % no]
#    url = url + '?u=http://is.gd/imWyT'
    url = url + '?u=http://flic.kr/p/a8jyps'
    print no, url
#    want = "https://chrome.google.com/webstore/detail/aicelmgbddfgmpieedjiggifabdpcnln"
    want = "http://www.flickr.com/photos/newyorkerinboulder/5990047408/"
    try:
        longurl = simplejson.loads(urllib2.urlopen(url).read())['url'];
    except Exception, e:
        longurl = e
    if want != longurl:
        print u'==>', longurl
        cmd = 'dotcloud restart urlrar.u%s .' % no
        print cmd
        os.system(cmd);
        check(no)


if __name__ == '__main__':
    start, end = 0, 20
    if len(sys.argv) > 1:
        start = int(sys.argv[1])
        end = start
        if len(sys.argv) > 2:
            end = int(sys.argv[2])
    print 'check %s => %s' % (start, end)
    for i in range(start, end + 1):
        check(i)
    
