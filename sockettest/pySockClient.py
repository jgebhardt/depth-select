from socket import *
clientSock = socket(AF_INET,SOCK_STREAM)
addr = ('127.0.0.1',6000)
clientSock.connect(addr)

for i in range(0,10): clientSock.send(bytes("Hello World!", 'UTF-8'))

