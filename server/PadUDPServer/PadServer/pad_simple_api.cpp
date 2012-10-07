
#include "pad_simple_api.h"

using namespace std;

pad_simple_api::pad_simple_api(){
	printf("Constructor: success");
}

long pad_simple_api::init(){
	HRESULT hr;

	// Wait object will indicate when new data is available
    hEvent = CreateEvent(NULL, FALSE, FALSE, NULL);
    
    // Entry point to Synaptics API
    hr = SynCreateAPI(pAPI);
	if (hr != SYN_OK)
	{
        printf("Could not initialize Synaptics COM API\n");
		return EXIT_FAILURE;
	}
    
    // Find the first USB TouchPad device connected to the system
	lHandle = -1;

	hr = pAPI->FindDevice(SE_ConnectionUSB, SE_DeviceTouchPad, &lHandle);
    if ( hr == SYNE_NOTFOUND)
    {
        printf("ForcePad not found\n");
        return EXIT_FAILURE;
    }
    
    // Create an interface to the ForcePad
    pAPI->CreateDevice(lHandle, pDevice);

    // Tell the device to signal hEvent when data is ready
	// difference between event notification and synchronous notification [?]
    pDevice->SetEventNotification(hEvent);

    // Enable multi-finger touch and grouped reporting
    pDevice->SetProperty(SP_IsMultiFingerReportEnabled, 1);
    pDevice->SetProperty(SP_IsGroupReportEnabled, 1);

    // Get the maximum number of fingers the device will report
    pDevice->GetProperty(SP_NumMaxReportedFingers, &lNumMaxReportedFingers);

    // Create an ISynGroup instance to receive per-frame data
    pDevice->CreateGroup(pGroup);
    
    // Create an ISynPacket instance to receive per-touch data
    pDevice->CreatePacket(pPacket);

    // Stop the ForcePad reporting to the operating system
    pDevice->Acquire(SF_AcquireAll);
	//isAcquired = 0;

	//initialize device properties
	XLoRim = YLoRim = XHiRim = YHiRim = ZMaximum = 0;
	lFingerCount = 0;
	firstDeviceUpdate = 0;
    cornerForce.resize(4, 0);

	//init index_array
	lFingerIndex = -1;
	for(int i=0;i<5;i++)
		index_array[i] = -1;

	return EXIT_SUCCESS;
}

void pad_simple_api::disconnect(){

	PRINT("Disconnecting from ForcePad");

    if (pDevice) 
    {
		if(isAcquired)
			pDevice->Unacquire();
        pDevice->SetEventNotification(nullptr); 
    }
	
	/*
    if (pAPI) 
    {
        pAPI->SetSynchronousNotification(nullptr); 
    }
	*/

    // Release all the COM objects
	pPacket->Release();
	pGroup->Release();
	pDevice->Release();
	pAPI->Release();

	// Release the wait object
    CloseHandle(hEvent);
}

long pad_simple_api::get_device_property(long specifier) const
{
    long value;
    pDevice->GetProperty(specifier, &value);
    return value;
}

string pad_simple_api::get_device_string_property(long specifier) const
{ 
    const int N = 256;
    unsigned char buffer[N];
    long length = N;
    pDevice->GetStringProperty(specifier, buffer, &length);
    return std::string((char*) buffer);

}

long pad_simple_api::get_group_property(long specifier) const
{
    long value;
    pGroup->GetProperty(specifier, &value);
    return value;
}

long pad_simple_api::get_group_property_indexed(long specifier, int index) const
{
    long value;
    pGroup->GetPropertyByIndex(specifier, index, &value);
    return value;
}

long pad_simple_api::get_packet_property(int i, long specifier) const
{
    pGroup->GetPacketByIndex(i, pPacket);
    long value;
    pPacket->GetProperty(specifier, &value);
    return value;
}

const bool pad_simple_api::connected() const
{
    return pDevice;
}

void pad_simple_api::update_device()
{
    if (connected())
    {
        XLoRim = get_device_property(SP_XLoRim);
        YLoRim = get_device_property(SP_YLoRim);
        XHiRim = get_device_property(SP_XHiRim);
        YHiRim = get_device_property(SP_YHiRim);
        ZMaximum = get_device_property(SP_ZMaximum);
        X.resize(lNumMaxReportedFingers, 0);
        Y.resize(lNumMaxReportedFingers, 0);
        Z.resize(lNumMaxReportedFingers, 0);
        F.resize(lNumMaxReportedFingers, 0);
        FingerState.resize(lNumMaxReportedFingers, 0);
        filteredF.resize(lNumMaxReportedFingers, 0.0);

		if(firstDeviceUpdate == 0)
		{
			printDeviceInfo();
			firstDeviceUpdate = 1;
		}
    }
}

HRESULT pad_simple_api::updatePacketData(){

	HRESULT hr = pDevice->LoadGroup(pGroup);
    
	//corner forces
	for (int i = 0; i != 4; ++i)
    {
        cornerForce[i] = get_group_property_indexed(SP_ForceRaw, i);
    }

	lFingerCount = 0;
	//x,y,z,F properties
    for (int i = 0; i != lNumMaxReportedFingers; ++i)
    {
        X[i] = get_packet_property(i, SP_X);
        Y[i] = get_packet_property(i, SP_Y);
        Z[i] = get_packet_property(i, SP_Z);
        F[i] = get_packet_property(i, SP_ZForce);
        FingerState[i] = get_packet_property(i, SP_FingerState);
		
		//counting active fingers
		if (FingerState[i] & SF_FingerPresent)
		{
			if(X[i] > 0 && Y[i] > 0)
			{
				//std::cout << "DEBUG: " << "X: " << X[i] << " Y: " << Y[i] << std::endl;
 				++lFingerCount;
			}
		}

        filteredF[i] = filteredF[i] * 0.6 + F[i] * 0.4;
    }
    return hr;
}

void pad_simple_api::printDeviceInfo()
{
	std::cout << "Device information: " << std::endl;
	std::cout << "X Low: " << XLoRim << " X High: " << XHiRim << std::endl;
	std::cout << "Y Low: " << YLoRim << " Y High: " << YHiRim << std::endl;
}

string pad_simple_api::csvData(){

	stringstream strTemp;

	if(lFingerCount != 0)
	{
		strTemp << lFingerCount << ";";
		//printf("Active Fingers: %d\n---\n", lFingerCount);
		for(int i=0; i != lNumMaxReportedFingers; i++)
		{
			if(FingerState[i] && SF_FingerPresent)
				//printf("Finger %d: Coordinates (%4d, %4d), low-pass +%3d grams, force +%3d grams, filtered force +%3d grams \n", i+1, X[i], Y[i], Z[i], F[i], filteredF[i]);
				strTemp << X[i] << "," << Y[i] << "," << Z[i] << "," << F[i] << "," << filteredF[i] << ";";
		}
		//printf("---\n---\n");
	}

	return strTemp.str();
}

/*

JSON format:

{
"fingers": ["X_val", "Y_val", "F_val"]
}

JSON example:

{"f":[[x,y,f], [x,y,f]]}

*/

/*
string pad_simple_api::jsonData()
{

	stringstream strTemp;
	avgRange = 5;

	strTemp << "{";
	if(lFingerCount != 0)
	{
		//strTemp << "\"fc\":" << lFingerCount << ", ";
		strTemp << "\"f\":[";
		int i=0;
		do
		{
			if(FingerState[i] && SF_FingerPresent)
			{
				strTemp << "[" << X[i] << "," << Y[i] << "," << F[i] << "," << Z[i] << "," << filteredF[i];
				strTemp << "]";
			}

			i++;
			if(i != lFingerCount)
			{
				strTemp << ",";
			}
			else
			{
				strTemp << "]";
				break;
			}
		}while(1);
	
	}

	strTemp << "}";
	return strTemp.str();
}
*/


long pad_simple_api::getFingerCount()
{
	int i = 0, fCount = 0;

	do
	{
		if(X[i] && Y[i])
		{
			fCount++;
		}
		i++;
	}while(i<5);

	return fCount;
}

string pad_simple_api::jsonData()
{
	stringstream strTemp;
	strTemp << "{\"f\":[";

	int i=0, fCount=getFingerCount();

	indices_loop();

	do
	{
		if(X[i] && Y[i])
		{
			if(i != 0 && fCount > 1)
				strTemp << ",";
			strTemp << "[";
			strTemp << getFingerIndex(i) << ",";
			strTemp << X[i] << "," << Y[i] << "," << F[i] << "," << Z[i] << "," << filteredF[i];
			strTemp << "]";
		}
		i++;
	}while(i<5);

	strTemp << "]}";
	return strTemp.str();
}

void pad_simple_api::indices_loop()
{
	std::vector<long> gpparray;
	std::vector<long>::iterator it;

	for(int i=0;i<5;i++)
	{
		if(X[i] && Y[i])
		{
			gpparray.push_back(get_packet_property(i, SP_FingerIndex));
		}
	}

	for(it = gpparray.begin(); it < gpparray.end(); it++)
	{
		if(index_array[*it] == -1)
		{
			index_array[*it] = ++lFingerIndex;
		}
	}
	
	for(int i=0;i<5;i++)
	{
		if(find(gpparray.begin(), gpparray.end(),i) == gpparray.end())
			index_array[i] = -1;
	}
}

long pad_simple_api::getFingerIndex(int i)
{
	return index_array[i];
}
