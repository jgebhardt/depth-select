import time

def clientHandler(client,address):
	print('client connected.')
	c = 0
	while True and c<100000:	
		c += 1
		#emulate jedeye sample rate (40Hz)
		time.sleep(1/40)
		client.sendall(str(c) + " server: "+str(time.clock()) + '\n')

	#while True:
	#	data = client.recv(1024)
	#	if not data: 
	#		break
	#	print data

	#thread will die when loop breaks
	client.close()
	print('client closed.')
#-----------------------------------------

from socket import *
import thread
import threading

sockServ = socket(AF_INET, SOCK_STREAM)
addr = ('127.0.0.1',6019)
sockServ.bind(addr)
sockServ.listen(1)
print('   socket server running at' + str(addr) + '.')

while True:
	
	#wait for client to connect
	client, address = sockServ.accept()
	thread.start_new_thread(clientHandler, (client,address))


