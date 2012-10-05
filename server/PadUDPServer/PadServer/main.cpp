
#include "pad_simple_api.h"
#include "socket_server.h"

#define PORT_NUM 1338

// Globals
SOCKADDR_IN addr;
SOCKET sConnect;

using namespace std;

/****
 * Initialize UDP socket
 * returns: none
 ****/
int initUDPSockServer()
{
	//winsock-dll BS
	long answer;
	WSAData wsaData;
	WORD DLLVERSION;
	DLLVERSION = MAKEWORD(2,1);

	//Start the DLL BS
	answer = WSAStartup(DLLVERSION,&wsaData);

	//create UDP socket
	sConnect = socket(AF_INET,SOCK_DGRAM, NULL);
	if(!sConnect)
	{
		WSACleanup();
		exit(0);
	}

	// fill UDP address information to send
	addr.sin_addr.s_addr = inet_addr("127.0.0.1");
	addr.sin_family = AF_INET;
	addr.sin_port = htons(PORT_NUM);

	return 0;
}

/****
 * UDP Client Handler
 * returns: DWORD WINAPI
 ****/
DWORD WINAPI UDPClientHandler(){

	printf("In UDPClientHandler\n");
	char buffer[1000];

	HRESULT hr;
	pad_simple_api app;

	//initialize device
	hr = app.init();
	if(hr == EXIT_FAILURE)
		return EXIT_FAILURE;

    do
    {
        // Wait until the event signals that data is ready
        WaitForSingleObject(app.hEvent, INFINITE);
		
		//update 
		app.update_device();

        // Load data into the ISynGroup instance, repeating until there is no more data
        while (app.updatePacketData() != SYNE_FAIL)
        {
			// Corner Forces ??
			//printf("Corner forces (grams) [%+3d, %+3d, %+3d, %+3d]\n", app.cornerForce[0], app.cornerForce[1], app.cornerForce[2], app.cornerForce[3]);
			
			printf("FingerCount: %d", app.lFingerCount);
			if(app.lFingerCount != 0)
			{
				string strTemp = app.jsonData();
				printf(strTemp.c_str());
				sprintf_s(buffer,strTemp.c_str());

				if(sendto(sConnect, buffer, strlen(buffer), 0, (sockaddr *) &addr, sizeof(addr)))
				{
					printf("Error sending datagram\n");
					//closesocket(sConnect);
					//WSACleanup();
					//exit(0);
				}
			}
        }
    }
	while(1);

	app.disconnect();
    return EXIT_SUCCESS;
}


/****
 * main function
 * returns: 0
 ****/
int main(int argc, char** argv)
{
	initUDPSockServer();
	UDPClientHandler();

	return 0;
}

