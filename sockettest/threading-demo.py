import threading

def handleBla (client, address):
  print(client, address)


t = threading.Thread(None, handleBla, None, ('foo', 'bar'))
t.start()

