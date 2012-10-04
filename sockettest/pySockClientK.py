from socket import *
import threading
import sys


def main():
  while True:
    data, addr = sock.recvfrom(64)
    print('data:', data)


address = ('127.0.0.1',6026)
sock = socket(AF_INET, SOCK_DGRAM)
sock.settimeout(5)
sock.bind(address)

t = threading.Thread(None, main, None, ())
t.start()
