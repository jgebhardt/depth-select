chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    'width': 600,
    'height': 700
  })
  
  var config = {
    //used for input scaling
    valueBounds : {
      x: {min:1000, max:6000},
      y: {min:1000, max:6000},
      f: {min:0, max:1500}
    },
    localIP: '128.237.133.127',
    localPort: 1338,
    UdpBufferSize:1024,
    readsPerSec: 40
  }


  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf))
  }

  //JSON format {"fc":2, "f":[[x,y,f], [x,y,f]]}
  function readSock(socket){
    var bufferSize = config.UdpBufferSize
    chrome.socket.recvFrom(socket.socketId, bufferSize, function(received){
      var res = ab2str(received.data)
      if (res != '') {
        console.log(res)
        onMessageReceived(msg)
      }
    })
    setTimeout((function(){readSock(socket)}), 1/config.readsPerSec)
  }


  // Create the Socket
  chrome.socket.create('udp', {}, function(socket){
    console.log('socket created: ', socket)
    
    chrome.socket.bind(socket.socketId, config.localIP, config.localPort, function(result){
      console.log('socket bind -> ', result)  
    })
    chrome.socket.getInfo(socket.socketId, function(socketinfo){
      console.log(socketinfo)
    })
    
    readSock(socket)
  })


  function onMessageReceived(msg) {
    $('#msg-list').append('<div class="msg">' + msg + '</div>')
  }


})