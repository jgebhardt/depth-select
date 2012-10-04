import time
from socket import *
import threading


sock = socket(AF_INET, SOCK_DGRAM)
time.sleep(3)

while True:
	c = 0
	while True and c < 100000:
		address = ('127.0.0.1', 6026)
		message = 'server: ' + str(c)
		sock.sendto(message, address)
		c += 1
		time.sleep(1/40)


