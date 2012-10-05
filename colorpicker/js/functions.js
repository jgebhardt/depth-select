/**** TEST ADDING FUNCTIONS ****/
var progress = 1;
var addR = function(type, html) {
	messages.push({ html: html });
	var r= { 
		html: '<div id="status"><div id="target">Target: <span></span></div> <div id="yours">Yours : <span></span></div> <div id="progress">Progress: <span></span></div><div id="time">Elapsed Time: <span></span></p></div></div><div class="colorpickerHolder"></div>',
		callback : function() {
			clearInterval(timer);
			var start = new Date();
			var end;
			addColorPicker[type]({
				flat: true,
				onChange : function(hsv) {
					your_color = HSBToRGB(hsv);
					your_color = rgbToHex(your_color.r,your_color.g,your_color.b);
					$('#yours span').css({background : your_color});
				}
			});

			target_color = getRandomColor();
			
			$('#target span').css({background : target_color});

			$('#progress span').html(progress+'/'+number_of_tests);
			$('#time span').html('0.000');
			timer = setInterval(function(){
				end = new Date();
				time = (end.getTime() - start.getTime());
				//time = ''+time/1000;
				
				$('#time span').html((time/1000));
			}, 10);
			progress++;
		},
		unload : function(msg) {
			
			tests[msg.type].push({target : target_color, your_color : your_color, duration : time});
		},
		transition: 'none'
	};
	r.type = type;
	
	for (var i =0;i<number_of_tests;i++) {
		messages.push(r);
	}
}
var addJedeyeTests = function() {
	addR('jedeye','<h2>Good job! Now we\'re going to run some tests with the Jedeye. Ready? Click right when you\'re ready to start. When youre happy with your color selection, hit next.');
}
var addNormalTests = function() {
	addR('normal','<h2>Good job! Now we\'re going to run some normal tests. Ready? Click right when you\'re ready to start. When youre happy with your color selection, hit next.');
}



/***** COLOR FUNCTIONS ****/
var getRandomColor = function(input) {
	if (! input) {
		function c() {
		  return Math.floor(Math.random()*256);
		}
		r = c();
		g = c();
		b = c();
		input = 'rgb('+r+', '+g+', '+b+')';
	}
  
  return rgbToHex(r,g,b);
}
var HSBToRGB = function (hsb) {
	var rgb = {};
	var h = Math.round(hsb.h);
	var s = Math.round(hsb.s*255/100);
	var v = Math.round(hsb.b*255/100);
	if(s == 0) {
		rgb.r = rgb.g = rgb.b = v;
	} else {
		var t1 = v;
		var t2 = (255-s)*v/255;
		var t3 = (t1-t2)*(h%60)/60;
		if(h==360) h = 0;
		if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
		else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
		else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
		else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
		else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
		else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
		else {rgb.r=0; rgb.g=0;	rgb.b=0}
	}
	return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
var setColor = function(x,y,z) {

	var limitRange = function(val) {
		if (val>100) { val = 100;}
		else if (val<0) { val = 0; }
		return val;
	}
	
	var b = 100-limitRange(y);
	var s = limitRange(x);
	var h = limitRange(z)/100*360;
	if (listen_to_set_color) {
		$('.colorpickerHolder').ColorPickerSetColor({h:h,s:s,b:b});		
	}
	
}
var listen_to_set_color = true;
var addColorPicker = {
	normal : function(args) {
		if (! args) {
			args = {flat: true};
		}
		listen_to_set_color = false;
		
		$('.colorpickerHolder').ColorPicker(args);
	},
	jedeye : function(args) {
		if (! args) {
			args = {flat: true};
		}
		listen_to_set_color = true;
		
		$('.colorpickerHolder').ColorPicker(args);
		$('.colorpickerHolder').after('<div class="overlay"></div>');
	}

};
