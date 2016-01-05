var cyw;  //this will reference the Control Your Way library
var recData = "";
var messages = "";
var sendCounter = 0;
var requestCountTimeout;

var repeatCnt = 1;
var repeatInterval = 10;
var send10 = false;
var repeatTimeout;

//this function runs when the page is finished loading
$(function () {
    cyw = ControlYourWayCreate();
    var networkNames = [];
	
    //set callbacks
    cyw.SetDataReceivedCallback(RecDataCallback);
    cyw.SetConnectionStatusCallback(ConnectionMessageCallback);
    cyw.SetErrorCallback(ErrorCallback);
    cyw.SetDebugMessagesCallback(DebugMessageCallback);
    //create username and network name textboxes and start button
    cyw.CywControl("cywControl");
    //see if previously entered information can be loaded from html5 local storage
    if (typeof (Storage) !== "undefined") {
        if (localStorage.cywUsername !== undefined) {
            cyw.SetUsername(localStorage.cywUsername);
        }
        if (localStorage.cywNetworkPassword !== undefined) {
            cyw.SetNetworkPassword(localStorage.cywNetworkPassword);
        }
        if (localStorage.cywNetworkNames !== undefined) {
            networkNames = localStorage.cywNetworkNames.split("\n");
        }
        else
        {
            networkNames.push("network 1");  //default to "network 1"
        }
    }
    else
    {
        networkNames.push("network 1");  //default to "network 1"
    }
	cyw.SetNetworkNames(networkNames);
    $('#spanSendCount').html(sendCounter.toString());
    requestCountTimeout = setTimeout(RequestCountTimeout, 1000);
});

function RequestCountTimeout() {
    var counters = cyw.GetCounters();
    $('#spanRequestCount').html(counters.download.toString());
    var bufferedAmount = cyw.GetBufferedAmount();
    $('#spanBufferedAmount').html(bufferedAmount.toString());
    requestCountTimeout = setTimeout(RequestCountTimeout, 1000);
}

//enable or disable SSL encryption
function UseEncryptionChanged() {
    if ($('#checkUseEncryption').prop('checked')) {
        cyw.SetUseEncryption(true);
    } else {
        cyw.SetUseEncryption(false);
    }
}

//enable or disable debug messages from being added to message box
function EnableDebugMessagesChanged() {
    if ($('#checkEnableDebugMessages').prop('checked')) {
        cyw.SetEnableDebugMessages(true);
    } else {
        cyw.SetEnableDebugMessages(false);
    }
}

//called when the send data button is clicked
function SendData() {
    var val;
    var sendData = cyw.CreateSendData();

    sendData.data = $('#textSendData').val();
    sendData.dataType = $('#textDataType').val();
    //if checked add send counter to send data
    if ($('#checkAddSendCountToString').prop('checked')) {
        sendData.data += sendCounter.toString();
    }
    //add session IDs if data is sent to specific devices
    val = $('#textSendToSessionIds').val();
    if (val !== "") {
        var sesIds = val.split(',');
        sendData.toSessionIDs = sesIds;
    }

    //add network names if message must be sent to specific networks
    var val = $('#textAreaToNetworks').val();
    if (val !== "") {
        var networkNames = val.split("\n");  //break lines into network names
        sendData.toNetworks = networkNames;
    }

    var errorCode = cyw.SendData(sendData);
    if (errorCode === "0") {
        //data was sent
    	sendCounter++;
    	$('#spanSendCount').html(sendCounter.toString()); //update send counter value in browser
    } else {
        messages += "Send Error: " + errorCode + "\n";
        messages += cyw.ConvertErrorCodeToString(errorCode) + "\n";
        $('#textAreaMessages').val(messages);
    }
}

//callback functions
function RecDataCallback(data, dataType, from, sender) {
    //check if a discovery response was received
    if ((cyw.GetDiscoverable()) && (dataType == "Discovery Response")) {
        AddMessage("Device Discovered: " + data + ", ID: " + from);
    }
    else {
    	recData += data;
    	$('#textAreaRecData').val(recData);
	}
}

function ErrorCallback(errorCode, sender) {
    messages += "Error: " + errorCode + "\n";
    messages += cyw.ConvertErrorCodeToString(errorCode) + "\n";
    $('#textAreaMessages').val(messages);
}

function ConnectionMessageCallback(connected, sender) {
    if (connected) {
        messages += "Connection successful\n";
        $('#spanSessionID').html(cyw.GetSessionID());

        //after successfull connect store cyw variables to local storage to make it easier to connect next time
        if ($('#checkSaveConnectionDetails').prop('checked')) {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("cywUsername", cyw.GetUsername());
                localStorage.setItem("cywNetworkPassword", cyw.GetNetworkPassword());
                //convert network names array into string for storing
                var networkNamesArray = cyw.GetNetworkNames();
                var networkNamesStr = "";
                var i;
                for (i = 0; i < networkNamesArray.length; i++) {
                    if (i > 0) {
                        networkNamesStr += "\n";
                    }
                    networkNamesStr += networkNamesArray[i];
                }
                localStorage.setItem("cywNetworkNames", networkNamesStr);
            }
        }
    } else {
        //there was an error, get the error message
        messages += "Connection error: " + cyw.ConvertErrorCodeToString(error) + "\n";
    }
    $('#textAreaMessages').val(messages);
}

function AddMessage(message) {
    messages += message + "\n";
    $('#textAreaMessages').val(messages);
}

function DebugMessageCallback(message, sender) {
    AddMessage("Debug message: " + message);
}

function ClearRecData() {
    $('#textAreaRecData').val("");
    recData = "";
}

function ClearMessages() {
    $('#textAreaMessages').val("");
    messages = "";
}

function SendDiscovery() {
    cyw.SendDiscovery();
}

function SetInstanceName() {
    cyw.name = $('#textInstanceName').val();
}

function DiscoverableChanged() {
    if ($('#checkDiscoverable').prop('checked')) {
        cyw.SetDiscoverable(true);
    } else {
        cyw.SetDiscoverable(false);
    }
}

function SetDownloadRequestTimeout() {
    cyw.SetDownloadRequestTimeout(parseInt($('#textDownloadRequestTimeout').val()));
}