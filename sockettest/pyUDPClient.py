# UDP Client

from socket import *
import select

clientSock = socket(AF_INET,SOCK_DGRAM)
clientSock.setblocking(0)
addr = ('', 1338)

clientSock.bind(addr)
clientSock.settimeout(0.01)

read_list = [clientSock]

print("Accepting data")
while True:
	print("NON")
	rd, wd, ed = select.select(read_list, [], [])
	for s in rd:
		if s is clientSock:
			data = clientSock.recvfrom(1024)
			print(data)