#include <SynKit.h>
#include <string>
#include <vector>
#include <sstream>
#include <iostream>

#include "com_ptr.h"

#pragma comment(lib, "SynCOM.lib") // For access point SynCreateAPI

#define PRINT(expr) printf(expr); printf("\n")

class pad_simple_api{
public:
	HANDLE hEvent;
	LONG lNumMaxReportedFingers;
	com_ptr<ISynAPI> pAPI;
	com_ptr<ISynDevice> pDevice;
	com_ptr<ISynGroup> pGroup;
	com_ptr<ISynPacket> pPacket;

	pad_simple_api();

	//functions
	long pad_simple_api::get_device_property(long specifier) const;
	std::string pad_simple_api::get_device_string_property(long specifier) const;
	long pad_simple_api::get_group_property(long specifier) const;
	long pad_simple_api::get_group_property_indexed(long specifier, int index) const;
	long pad_simple_api::get_packet_property(int i, long specifier) const;

	const bool pad_simple_api::connected() const;
	void pad_simple_api::update_device();
	
	//public functions
	long init();
	void disconnect();
	HRESULT updatePacketData();
	std::string csvData();
	std::string jsonData();

	//device properties
    long XLoRim;
    long YLoRim;
    long XHiRim;
    long YHiRim;
    long ZMaximum;
    // Touchpad corner forces
    std::vector<long> cornerForce;
    // Per-finger properties X, Y, Z(touch size), F(force), 
    std::vector<long> X, Y, Z, F, FingerState;
    std::vector<double> filteredF;
	//Active finger count
	long lFingerCount;

private:
	LONG lHandle;
	long isAcquired;
};