#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import urllib2
import simplejson

def check(no):
    url = 'http://urlexpand%s.appspot.com/api?u=http://is.gd/imWyT&f=json' % no
    url = 'http://url%s.fawave.dotcloud.com/?u=http://is.gd/imWyT' % no
    print url
    want = "https://chrome.google.com/webstore/detail/aicelmgbddfgmpieedjiggifabdpcnln"
#    info = simplejson.loads(urllib2.urlopen(url).read())
#    longurl = info['url']
    try:
        longurl = urllib2.urlopen(url).read();
    except Exception, e:
        longurl = e
    if want != longurl:
        print u'==>', longurl
        cmd = 'dotcloud push fawave.url%s .' % no
        print cmd
        os.system(cmd);
        check(no)


if __name__ == '__main__':
    start, end = 0, 51
    if len(sys.argv) > 1:
        start = int(sys.argv[1])
        end = start + 1
        if len(sys.argv) > 2:
            end = int(sys.argv[2]) + 1
    print 'check %s => %s' % (start, end)
    for i in range(start, end):
        check(i)
    
