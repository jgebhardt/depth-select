/*** Our config ***/
var number_of_tests = 3;
/*** initial messages ***/
var messages = [
	{ html : '<h1>Welcome to the testing!</h1><h2>To proceed with the test, use the right arrow key.</h2>'},
	{ 
		html : '<h1>Practice picking a color</h1><h2>First, we\'re going to introduce you to the different interfaces. When you\'re comfortable picking a color, click next (or use your right arrow key)<hr /><div class="colorpickerHolder"></div>' ,
		callback : function() {
			addColorPicker.normal();
			
			
		}
	},
	{ 
		html : '<h1>Practice with the Jedeye</h1><h2>Now do it with the Jedeye. When you\'re comfortable picking a color, click next (or use your right arrow key)</h2><p>Raunaq: update the color picker by doing setColor(x,y,z)</p><hr /><div class="colorpickerHolder"></div>' ,
		callback : function() {
			addColorPicker.jedeye();
			
		}
	}
];


/** add the actual tests, randomly **/
switch(Math.round(Math.random(0,1))) {
	case 0 :
		addNormalTests();
		addJedeyeTests();
		
	break;
	case 1 :
		addJedeyeTests();
		addNormalTests();
	break;
}

//// final slide
messages.push({html : '<h1>Great job!</h1><h2>You\'ve contributed to the furtherment of science.</h2>', callback : function() {
	console.log(tests);
	$('#content').append('<br /><br /><br /><br /><code style="margin: 0 auto; width: 600px;">'+JSON.stringify(tests)+'</code>');
}});






/** internal vars **/
var current_frame = 0;
var tests = {
	jedeye : [],
	normal : []
};
var timer;
var time;
var target_color;
var your_color;
var setFrame = function(html) {
	var content = $('#content');
	switch(html.transition) {
		case 'none' :
			$('#content').html(html.html);	
			if (html.callback) { html.callback(); }
		break;
		default :
			$(content).fadeOut(function(){
				
				
				$('#content').html(html.html);	
				$('#content').hide().fadeIn();	
				if (html.callback) { html.callback(); }
			});
		break;
	}
	
	
}

var unload;
setFrame(messages[current_frame++]);

window.addEventListener('keydown', function(event) {
	
  	switch (event.keyCode) {
    	case 39: // Right
    		if (messages[current_frame]) {
    			
    			if (messages[current_frame-1] && messages[current_frame-1].unload) { 
    				messages[current_frame-1].unload(messages[current_frame-1]); 
    			}

    			setFrame(messages[current_frame]);
    			
    			current_frame++;
    		} else {
    			//console.log('End!');
    		}
      		
    	break;
  	}
}, false);

var c = 0
var fhist = []
var histCount = 20

//converts ranges to 0..100 
var setColorByPad = function(data) {
  
  //x, y, f: raw force, s: touch size, f2: filtered force
  var x, y, f, s, f2 = 0
  var conversions = {
    x: {min: 1000, max: 5800, target: 100},
    y: {min: 1200, max: 4700, target: 100},
    f: {min: 0, max: 500, target: 100},
    s: {min: 0, max: 100, target: 100},
    f2: {min: 0, max: 500, target: 100}
  }
  

  if (data || data.f || data.f[0]) {
    x = (data.f[0][0] - conversions.x.min) / (conversions.x.max - conversions.x.min) * conversions.x.target
    y = (conversions.y.max - data.f[0][1]) / (conversions.y.max - conversions.y.min) * conversions.y.target
    f = Math.max(data.f[0][2],conversions.f.min) / (conversions.f.max - conversions.f.min) * conversions.f.target
    s = Math.max(data.f[0][3],conversions.s.min) / (conversions.s.max - conversions.s.min) * conversions.s.target
    f2 = Math.max(data.f[0][4],conversions.f.min) / (conversions.f2.max - conversions.f2.min) * conversions.f2.target
    
    c++
    fhist[c % histCount] = f
    var favg = _.reduce(fhist, function(i, m){return m+i})/histCount
    setColor(x, y, favg)
    //console.log(fhist, favg, f)
  } else {
    console.log('empty packet: ', data)

  }
}

var bounds = {
    c: 0,
    x: {min: 0, max: 0, sum:0, avg: 0},
    y: {min: 0, max: 0, sum:0, avg: 0},
    f: {min: 0, max: 0, sum:0, avg: 0},
    s: {min: 0, max: 0, sum:0, avg: 0},
    f2: {min: 0, max: 0, sum:0, avg: 0}
}

var findBounds = function(data){
  //console.log(data)
  var old = bounds;
  bounds.c++
  changed = false
  if(data[0][0] < bounds.x.min) { bounds.x.min = data[0][0]; changed = true;}
  if(data[0][1] < bounds.y.min) { bounds.y.min = data[0][1]; changed = true;}
  if(data[0][2] < bounds.f.min) { bounds.f.min = data[0][2]; changed = true;}
  if(data[0][3] < bounds.s.min) { bounds.s.min = data[0][3]; changed = true;}
  if(data[0][4] < bounds.f2.min) { bounds.f2.min = data[0][4]; changed = true;}
  
  if(data[0][0] > bounds.x.max) { bounds.x.max = data[0][0]; changed = true;}
  if(data[0][1] > bounds.y.max) { bounds.y.max = data[0][1]; changed = true;}
  if(data[0][2] > bounds.f.max) { bounds.f.max = data[0][2]; changed = true;}
  if(data[0][3] > bounds.s.max) { bounds.s.max = data[0][3]; changed = true;}
  if(data[0][4] > bounds.f2.max) { bounds.f2.max = data[0][4]; changed = true;}

  bounds.x.sum += data[0][0]
  bounds.y.sum += data[0][1]
  bounds.f.sum += data[0][2]
  bounds.s.sum += data[0][3]
  bounds.f2.sum += data[0][4]

  bounds.x.sum = bounds.x.sum / bounds.c
  bounds.y.avg = bounds.y.sum / bounds.c
  bounds.f.avg = bounds.f.sum / bounds.c
  bounds.s.avg = bounds.s.sum / bounds.c
  bounds.f2.avg = bounds.f2.sum / bounds.c

  if (changed) {
    console.log(bounds)
  }
}


var FakeWebSocket = function() {
  
    
    //setTimeout(trigger, 500)
    onopen()
    
    var trigger = function() {
      
      this.onMessage(generateOutput())
      setTimeout(trigger, 500)  
    }

    var generateOutput = function(){
      return '{"fc":1, "f":[[2834,2650,-2,52,0.343923]]}'
    }
  
};

$(document).ready(function() {

  var ws = new WebSocket("ws://128.237.128.231:9999/");
  ws.onopen = function() {
    console.log('onOpen');
    ws.send("Hello Mr. Server!");
    
  };
  ws.onmessage = function (e) {
    var data = $.parseJSON(e.data)
    findBounds(data.f)
    setColorByPad(data);
  };
  ws.onclose = function() { };

});