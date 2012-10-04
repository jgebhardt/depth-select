from socket import *
import threading
import sys

def handleIncoming():
  sock = socket(AF_INET,SOCK_STREAM)
  addr = ('127.0.0.1',6019)
  #sock.setblocking(False)
  sock.connect(addr)
  print(str(sock) + "thread started, receiving...")
  while True:
    print("receiving...")
    data = sock.recv(64)
    bpy.data.objects['cam_handle'].rotation_euler.rotate_axis('Z', pi/3600)
    print("received")
    if not data: 
      print("no data")
      break
    print(data)
    sys.stdout.flush()
  print("closing socket")
  sock.close()

#handleIncoming()
threading.Thread(None, handleIncoming, None, []).start()
