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