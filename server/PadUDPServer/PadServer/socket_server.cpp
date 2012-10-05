
#include "socket_server.h"

/********************************************************************
init routine for our server
*********************************************************************/
void initSockServer()
{
	//we have to start the winsock-dll
	long answer;
	WSAData wsaData;
	WORD DLLVERSION;
	DLLVERSION = MAKEWORD(2,1);

	//start the dll using wsa startup
	answer = WSAStartup(DLLVERSION,&wsaData);

	//Structure for our sockets
	addrlen = sizeof(addr);
		
	//basic settings for sConnect (handle for the client once connected)
	sConnect = socket(AF_INET,SOCK_STREAM, NULL);
	addr.sin_addr.s_addr = inet_addr("127.0.0.1");
	addr.sin_family = AF_INET;
	addr.sin_port = htons(PORT_NUM);

	//basic settings for sListen (handle for the listener)
	sListen = socket(AF_INET,SOCK_STREAM,NULL);
	bind(sListen, (SOCKADDR*)&addr, sizeof(addr));
	listen(sListen, SOMAXCONN);

}

/********************************************************************
this routine represents the behavior for every client thread will be
spawned. Here, we simply dump a string to the client. This routine will
be invoked directly from main.
********************************************************************/
DWORD WINAPI ClientHandler(void* arg){
	SOCKET* clientSock = (SOCKET*) arg;
	int bytecount;
	int index = clientIndex++;
	char buffer[100];


	/*---------------------------*/
	HRESULT hr;
	pad_simple_api app;

	//initialize device
	hr = app.init();
	if(hr == EXIT_FAILURE)
		return EXIT_FAILURE;

    printf("Touch the surface to see properties\n");
    printf("Touch with %d fingers to quit\n", app.lNumMaxReportedFingers);

    do
    {
        // Wait until the event signals that data is ready
        WaitForSingleObject(app.hEvent, INFINITE);
		
		//update 
		app.update_device();

        // Load data into the ISynGroup instance, repeating until there is no more data
        while (app.updatePacketData() != SYNE_FAIL)
        {
			//printf("Corner forces (grams) [%+3d, %+3d, %+3d, %+3d]\n", app.cornerForce[0], app.cornerForce[1], app.cornerForce[2], app.cornerForce[3]);
			if(app.lFingerCount != 0)
			{
				printf("Active Fingers: %d\n---\n", app.lFingerCount);
				for(int i=0; i != app.lNumMaxReportedFingers; i++)
				{
					if(app.FingerState[i] && SF_FingerPresent)
						printf("Finger %d: Coordinates (%4d, %4d), low-pass +%3d grams, force +%3d grams, filtered force +%3d grams \n", i+1, app.X[i], app.Y[i], app.Z[i], app.F[i], app.filteredF[i]);
				}
				printf("---\n---\n");
			}
        }
    }
	while(1);
    //while (app.lFingerCount < app.lNumMaxReportedFingers);

    printf("%d finger gesture detected; exiting\n", app.lNumMaxReportedFingers);

	app.disconnect();

    return EXIT_SUCCESS;

	/*---------------------------*/

	sprintf_s(buffer,"Hello World: %d\n", index);
	while((bytecount = send(*clientSock,buffer,strlen(buffer),0)) != SOCKET_ERROR);
	return 0;
}

