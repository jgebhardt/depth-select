import struct
import SocketServer
from base64 import b64encode
from hashlib import sha1
from mimetools import Message
from StringIO import StringIO

from socket import *
import select
import re

class WebSocketsHandler(SocketServer.StreamRequestHandler):
    magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
    json_regex = re.compile("[{}].*[}]")

    def setup(self):
        
        print "Initializing UDP Client"
        self.clientSock = socket(AF_INET,SOCK_DGRAM)
        self.clientSock.setblocking(0)
        self.addr = ("127.0.0.1",1338)
        self.clientSock.bind(self.addr)
        self.clientSock.settimeout(0.01)
        self.read_list = [self.clientSock, self.request]
        
        SocketServer.StreamRequestHandler.setup(self)
        print "connection established", self.client_address
        self.handshake_done = False

    def format_data(self, in_data):

        #format incoming json before pushing to websocket
        out_data = self.json_regex.search(str(in_data)).group(0)
        return out_data

    def handle(self):
        while True:
            rd, wd, ed = select.select(self.read_list, [], [])
            for s in rd:
                if s is self.clientSock:
                    data = self.clientSock.recvfrom(1024)
                    #print(data)
                    self.send_message(self.format_data(data))
                elif s is self.request and not self.handshake_done:
                    self.handshake()


    def read_next_message(self):
        length = ord(self.rfile.read(2)[1]) & 127
        if length == 126:
            length = struct.unpack(">H", self.rfile.read(2))[0]
        elif length == 127:
            length = struct.unpack(">Q", self.rfile.read(8))[0]
        masks = [ord(byte) for byte in self.rfile.read(4)]
        decoded = ""
        for char in self.rfile.read(length):
            decoded += chr(ord(char) ^ masks[len(decoded) % 4])
        self.on_message(decoded)

    def send_message(self, message):
        self.request.send(chr(129))
        length = len(message)
        if length <= 125:
            self.request.send(chr(length))
        elif length >= 126 and length <= 65535:
            self.request.send(chr(126))
            self.request.send(struct.pack(">H", length))
        else:
            self.request.send(chr(127))
            self.request.send(struct.pack(">Q", length))
        self.request.send(message)

    def handshake(self):
        data = self.request.recv(1024).strip()
        headers = Message(StringIO(data.split('\r\n', 1)[1]))
        if headers.get("Upgrade", None) != "websocket":
            return
        print 'Handshaking...'
        key = headers['Sec-WebSocket-Key']
        digest = b64encode(sha1(key + self.magic).hexdigest().decode('hex'))
        response = 'HTTP/1.1 101 Switching Protocols\r\n'
        response += 'Upgrade: websocket\r\n'
        response += 'Connection: Upgrade\r\n'
        response += 'Sec-WebSocket-Accept: %s\r\n\r\n' % digest
        self.handshake_done = self.request.send(response)

    def on_message(self, message):
        print message
        self.send_message("Got your message!")

if __name__ == "__main__":
    print "Waiting for websocket connections..."
    server = SocketServer.TCPServer(
        ("", 9002), WebSocketsHandler)
    server.serve_forever()
