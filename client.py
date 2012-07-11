#!/usr/bin/env python

# Copyright (c) Twisted Matrix Laboratories.
# See LICENSE for details.


from twisted.internet.protocol import ClientFactory, Protocol
from twisted.internet import reactor
import sys
import re
import time



class EchoClient(Protocol):
    def __init__(self):
        self.data = "This is some data."
        self.buff = ""
	self.done = []
        self.x    = 1000
	self.storeCount = 0
	self.retrCount  = 0
	self.msgCount   = 0
	self.writeStart = float()
	self.writeEnd   = float()
	self.readStart  = float()
	self.readEnd    = float()
    def connectionMade(self):
        self.writeStart = time.time()
        for i in range(self.x):
	    self.transport.write('!!@@##$$STOR ' + str(i+1) + ' ' + self.data + '$$##@@!!')
	print str(i + 1) + ' store commands sent'
	

    def dataReceived(self, line):
	self.msgCount += 1
	line = self.buff + line
	for match in re.findall('\!\!\@\@\#\#\$\$(.*?)\$\$\#\#\@\@\!\!', line):
            mesg = match.split(' ', 2)
	    line = line.replace('!!@@##$$' + match + '$$##@@!!', '')
	    #print match
            if   mesg[0] == "DATA":
		self.retrCount += 1
		if self.retrCount == (self.x - 1):
			self.readEnd = time.time()
			print 'Reading took: ' + str((self.readEnd - self.readStart) * 1000) + 'ms'
			print 'Test complete'
            elif mesg[0] == "OK":
                self.storeCount += 1
		print str(self.storeCount) + ' stored ' + mesg[1]
		print match
                if self.storeCount == (self.x):
                    self.writeEnd = time.time()
		    writeTime = (self.writeEnd - self.writeStart) * 1000
		    print 'Writing took: ' + str(writeTime) + 'ms'
		    self.readStart = time.time()
                    for i in range(self.x):
                        self.transport.write('!!@@##$$RETR ' + str(i+1) + '$$##@@!!')
            
            elif mesg[0] == "ERRO":
	        print 'Error: ' + mesg[2] + ' ' + mesg[1]
        self.buff = line


class EchoClientFactory(ClientFactory):
    protocol = EchoClient

    def clientConnectionFailed(self, connector, reason):
        print 'connection failed:', reason.getErrorMessage()
        reactor.stop()

    def clientConnectionLost(self, connector, reason):
        print 'connection lost:', reason.getErrorMessage()
        reactor.stop()

def main():
    factory = EchoClientFactory()
    reactor.connectTCP('localhost', 1337, factory)
    reactor.run()

if __name__ == '__main__':
    main()
