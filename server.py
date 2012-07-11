import re
import sys
dataStore = {}
import socket

HOST = ''                 # Symbolic name meaning all available interfaces
PORT = 1337               # Arbitrary non-privileged port
BUFF = ''
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen(1)
conn, addr = s.accept()
prog = re.compile(r'\!\!\@\@\#\#\$\$(.*?)\$\$\#\#\@\@\!\!', flags=re.DOTALL|re.MULTILINE)

while 1:
    msg = conn.recv(1024)
    if not msg: break
    data = BUFF + msg
    for match in prog.findall(data):
        mesg = match.split(' ', 2)
        data = data.replace('!!@@##$$'+match+'$$##@@!!', '')
        if   mesg[0] == "STOR":
            dataStore[mesg[1]] = mesg[2]
            conn.sendall('!!@@##$$OK   '+ mesg[1]  +'$$##@@!!')
        elif mesg[0] == "RETR":            
            if mesg[1] in dataStore:
                conn.sendall('!!@@##$$DATA ' + mesg[1]  + ' ' + dataStore[mesg[1]] + '$$##@@!!')
            else :
                conn.sendall('!!@@##$$ERRO '+ mesg[1]  +' KEY NOT FOUND$$##@@!!')
        else:
            conn.sendall('!!@@##$$ERRO 0000 Bad command sent$$##@@!!')
        BUFF = data
