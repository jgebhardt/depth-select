def clientHandler(client,address):
	while True:
		data = client.recv(1024)
		if not data: 
			break
		print data

	#thread will die when loop breaks
	client.close()
#-----------------------------------------

from socket import *
import thread
import threading

sockServ = socket(AF_INET, SOCK_STREAM)
addr = ('127.0.0.1',6000)
sockServ.bind(addr)
sockServ.listen(1)

while True:
	
	#wait for client to connect
	client, add = sockServ.accept()
	thread.start_new_thread(clientHandler, (client,add))


