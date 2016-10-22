
var json;
var items;
var canvas;
var tanvas;
var w;
var h;
var context;
var measures;
var constants;
var stack = []; //STACK of indexes been choose
var frags = []; //Stack of lengths of levels been choose
var debugSplice = 6;

$(document).ready(function() {
	init();
    start();
  	redrawBackground();
  	redrawElements();
});

$(window).resize(function() {
	init();
  	redrawBackground();
  	redrawElements();
});

function init()  {
	w = $(window).width();
    h = $(window).height();
    measures = {};
    measures.viewport = {}
    measures.center = {};
    constants = {};
    constants.item = {width:200, height:200, radius: 300, semiwidth:100, semiheight:100};
    constants.kern = {width:200, height:200, radius: 150, semiwidth:100, semiheight:100};
	canvas = $('#miCanvas')[0];
	tanvas = $('#miTanvas')[0];
}

function start() {
	var pjson = getJson();
	json = pjson[0];
	items = json.content;
	//items = items.splice(-debugSplice, debugSplice);
	//count = items.length;
	frags.push(items.length);
}

function redrawBackground() {
	console.log("redraw background");
	measures.center.x = $(window).scrollLeft() + $(window).width() / 2;
	measures.center.y = $(window).scrollTop() + $(window).height() / 2;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	tanvas.width = window.innerWidth;
	tanvas.height = window.innerHeight;
	$(tanvas).css('opacity','0');
	context = canvas.getContext('2d');
	tontext = tanvas.getContext('2d'); 
	context.clearRect(0, 0, canvas.width, canvas.height);
	tontext.clearRect(0, 0, tanvas.width, tanvas.height);

	context.fillStyle="#DDD";
	context.fillRect(0,0, canvas.width, canvas.height);
	tontext.fillStyle="#000";
	tontext.fillRect(0,0, tanvas.width, tanvas.height);

	var litems = getLastBranch();	
	var parent = getLastParent();
	loadAllImages(litems, function(images) {
		console.log("loadAllImages did");
		for (var index = 0; index < litems.length; index++) {
			var item = litems[index];
			var image = images[index];
			drawElementBackground(measures.center.x, measures.center.y, 1200, index, litems.length, image);
		};
		console.log("drawElementBackground did");

		loadImage(parent, function(image){
			console.log("loaded image for center "+image);
			drawCenterElementBackground(measures.center.x, measures.center.y, constants.kern.radius, litems.length, image);
		});
		
	});

	
}

function redrawElements(will, item) {
	if (will != -1) {
		$('#viewport').empty();
	} else {
		$(item).siblings().remove();
	}
	
	var litems = getLastBranch();
	var parent = getLastParent();

	drawElement(-1, parent.title.text, -1);
	$(item).remove();
	
	for (var index = 0; index < litems.length; index++) {
		if (will != index) {
			var item = litems[index];
			drawElement(1, item.title.text, index);
		}
	};
	
	
}

function getRadialLocation(count, index) {
	var radius = constants.item.radius;
	var angle = index * 2 * Math.PI / count;
	var y = (index >= 0) ? (radius * Math.sin(angle)) : 0;
	var x = (index >= 0) ? (radius * Math.cos(angle)) : 0;
	var _top = measures.center.y - y;
	var _left = x + measures.center.x;
	return {top:_top,left:_left};
}

function getSemiRadialLocation(count, index, radius) {
	var angle = index * 2 * Math.PI / count;
	var semi = Math.PI / count;
	angle = angle - semi;
	var y = radius * Math.sin(angle);
	var x = radius * Math.cos(angle);
	var _top = measures.center.y - y;
	var _left = x + measures.center.x;
	return {top:_top, left:_left};
}


function drawElement (time, text, index) {
	var origin = getRadialLocation(last(frags), index);
	var top = origin.top;
	var left = origin.left;
	$('<div>').appendTo('#viewport').css(
		{
			position: 'absolute', 
			top: measures.center.y - constants.item.semiheight,
			left: measures.center.x - constants.item.semiwidth,
			width: constants.item.width,
			height: constants.item.height,
			opacity: 0,
			zIndex: 100
		}
	).append(
		$('<p>').text(text).css(
			{
				width: constants.item.width,
				textAlign: "center",
				position: "relative",
				top: "50%",
				transform: "translateY(-50%)"
			}
		)
	).animate(
		{
			opacity: 1,
			top: top - constants.item.semiheight,
			left: left - constants.item.semiwidth,
		},
		"fast"
	).click(function(){volve(time, this, index)});
}

function getItemChild(items) {
	if(items && items.content && items.length >0 ) {
		return item.content;
	}
}

function getItemsAtLevel(index, level) {
	if (items && items.length > 0) {
		if (level == 0) {
			return items;
		} else if (level > 0) {
			var lastchild = items;
			for (var i = 0; i <= level; i++) {
				if(lastchild && lastchild.content && lastchild.length > 0) {
					console.log("_level has content " + level);
					lastchild = lastchild.content;
				} else {
					console.log("_level has NO content " + level);
					lastchild = null;
				}
			}
			return lastchild;
		}
	}
}

function getLastBranch() {
	var last = json;
	if (stack.length>0) {
		for (var i = 0; i < stack.length; i++) {
			last = getContent(last);
			last = last[stack[i]];
		};
	}
	return getContent(last);
}

function getLastParent() {
	if (stack.length == 0) {
		return json;
	} else {
		var last = items;
		for (var i = 0; i < stack.length; i++) {
			if (i>0) last = getContent(last);
			last = last[stack[i]];
		};
		return last;
	}
}

function loadAllImages(items, callback) {
	var images = [];
	var cnt = 0;
	for (var index = 0; index < items.length; index++) {
		var imageSrc = items[index].image;
		if (imageSrc != null) {
			var image = new Image();
		    image.onload = function() {
		        ++cnt;
		        if (cnt >= items.length) callback(images);
		    };
		    image.onerror = function() {
		    	++cnt;
		        if (cnt >= items.length) callback(images);
		    }
		    image.src = imageSrc;
	    	images.push(image);
		} else {
			images.push(null);
			++cnt;
			if (cnt >= items.length) callback(images);
		}
	};
}

function loadImage(item, callback) {
	console.log("loadImage");
	var imageSrc = item.image;
	if (imageSrc != null) {
		console.log("loadImage img not null");
		var image = new Image();
		image.onload = function() {
			callback(image);
		};
		image.onerror = function() {
			callback();
		};
		image.src = imageSrc;
	} else {
		console.log("loadImage img IS null");
		callback();
	}
}

function getFutureItems(_index) {
	var _level = stack.length;
	if (items && items.length > 0) {
		var lastchild = getLastBranch();
		return getContent(lastchild[_index]);
	}
}

function getContent(branch) {
	if (branch && branch.content && branch.content.length > 0) {
		return branch.content;
	}
}

function volveDatum(time, will) {
	//VOLVE: to invole or evolve
	// TIME > 0 equals future, deterministic freewill future
	// TIME < 0 equals past, deterministic causal past

	if (time > 0) {
		var future = getFutureItems(will);
		if (future == null) return;
		stack.push(will);
		frags.push(future.length);
		return true;
	} else if (time < 0) {
		if (stack.length<1) return;
		var past_index = stack.pop();
		var past_length = frags.pop(); 
		return true;
	}
}

function volve(time, item, index) {

	if (!volveDatum(time, index)) return;

	var lastindex = (time > 0) ? stack[frags.length-1] : -1;
	var lastlength = last(frags);
	var origin = getRadialLocation(lastlength, lastindex);
	var final_top = origin.top - constants.item.semiheight;
	var final_left = origin.left - constants.item.semiwidth;

	$(item).stop().siblings().hide("fast", function(){
		$(item).stop().animate(
			{
				top: final_top, left: final_left,
			},
			"fast",
			function() {
				redrawBackground();
				redrawElements(lastindex, item);
			}
		);
	});
}

function last(array) {
	return array[array.length -1];
}

function drawCenterElementBackground(x, y, radius, count, image) {
	console.log("drawCenterElementBackground");
	console.log("image is "+image);
	var color = getRadialColor(-1, count);
	var fill = color ;
	if (image != null) fill = context.createPattern(image,'repeat');
	context.lineWidth = 5;
	context.strokeStyle = color;
	context.fillStyle = fill;
	context.beginPath();
	if (count > 2) {
		for (var i = 0; i <= count; i++) {
			var origin = getSemiRadialLocation(count, i, radius);
			if (i == 0) {
				context.moveTo(origin.left, origin.top);
			} else {
				context.lineTo(origin.left, origin.top);
			}
		};
	} else {
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
	}
	context.fill();
	context.stroke();
}

function drawElementBackground(x, y, radius, index, count, image) {
	var color = getRadialColor(index,count); 
	var semi = Math.PI / count;
	var starta = (index * 2 * Math.PI / count) - semi;
	var enda = ((index + 1) * 2 * Math.PI / count) - semi;
	starta = (2 * Math.PI) - starta; 
	enda = (2 * Math.PI) - enda;

	if (image != null) {
		var pattern = context.createPattern(image,'repeat');
		drawArc(x, y, radius, starta, enda, color, pattern);
	} else {
		drawArc(x, y, radius, starta, enda, color, color);
	}
}

function drawArc(x, y, radius, start, end, stroke, fill) {
	context.lineWidth = 0;
	context.strokeStyle = stroke;
	context.fillStyle = fill;
	context.beginPath();
	context.moveTo(x, y);
	context.arc(x, y, radius, start, end, true);
	context.lineTo(x, y);
	context.fill();
	context.stroke();
}

function getRadialColor(_index, _count) {
	var tonalw = getLevelTonalWidth();
	if (_index < 0) { return tonalw.kern; }
    var h = (_index * tonalw.depth / (_count-1)) + tonalw.base;
    var s = tonalw.sat;
    var l = tonalw.light;
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function getLGBTTTIRadialColor(_index, _count) {
	switch (_index) {
	    case 0:
	        day = "red";
	        break;
	    case 1:
	        day = "orange";
	        break;
	    case 2:
	        day = "yellow";
	        break;
	    case 3:
	        day = "green";
	        break;
	    case 4:
	        day = "turquoise";
	        break;
	    case 5:
	        day = "indigo";
	        break;
	    case 6:
	        day = "violet";
	        break;
	}
	return day;
}

function getLevelTonalWidth() {
	var _base = 0;
	var dase = 0;
	var _depth = 240;
	var pepth = 240;
	var _sat = 60;
	var s = 60;
	var _light = 50;
	var l = 50;
	var _kern = 'white';
	var satstep = 20;
	var lightstep = -10;

	_sat = _sat + (satstep * frags.length);
	_light = _light + (lightstep * frags.length);

	if (stack.length != 0) {
		for (var i = 0; i < frags.length-1; i++) {
			var lale = frags[i];
			var lali = stack[i];
			var slice = 1 / (lale + 2);
			var plice = 1 / lale;
			pepth = plice * pepth;
			dase = (lali * pepth) + dase;
			_depth = slice * _depth;
			_base = (lali * _depth) + _base;
			if (i == frags.length-2) {
				var h = dase;
				_kern = 'hsl(' + h + ',' + s + '%,' + l + '%)';
			}
		};
	}

	return {base:_base, depth:_depth, sat:_sat, light:_light, kern:_kern};
}


function getJson() {
	return [
	{
  "id": 0,
  "slug": "desktop",
  "kind": "diskus",
  "mode": "transparent",
  "background": "random",
  "size": "room",
  "volume": 0.2,
  "effects": {
    "fling left":"swoosh2",
    "fling right":"swoosh",
    "select":"breath"
  },
  "started":"tour", 
  "first":0,
  "title":{"text":"Start"},   
  "content": [
        {
          "appearance": "soundtext",
          "image": "images/arabic.jpg",
          "focus": 1,
          "title": {
              "text": "Telephone",
              "sex": "default",
              "speed": 1,
              "pitch": 1,
              "volume": 1,
              "font": "default",
              "delay": 0
          },
          "sound": {
              "file": "phone",
              "volume": 1,
              "delay": 0,
              "pitch": 1
          },
          "click": {
              "kind": "launch",
              "name": "dial",
              "predicate": "",
              "gesture": "select"
          },
          "content":[
          	{"title":{"text":"DO"}},{"title":{"text":"RE"}},{"title":{"text":"MI"}}
          ]
      },
      {
          "appearance": "soundtext",
          "image": "images/arc.png",
          "focus": 1,
          "title": {
              "text": "Contacts",
              "sex": "default",
              "speed": 1,
              "pitch": 1,
              "volume": 1,
              "font": "default",
              "delay": 0
          },
          "sound": {
              "file": "people",
              "volume": 1,
              "delay": 0,
              "pitch": 1
          },
          "click": {
              "kind": "launch",
              "name": "contacts",
              "predicate": "",
              "gesture": "select"
          },
          "content":[
          	{"title":{"text":"FA"}},{"title":{"text":"SOL"}},
          	{
          		"title":{"text":"LA"},
          		"content":[
					{"title":{"text":"ut"}},{"title":{"text":"queant"}}
          		]
          	}
          ]
      },
      {
          "appearance": "soundtext",
          "image": "images/rainbow.png",
          "focus": 1,
          "title": {
              "text": "Music",
              "sex": "default",
              "speed": 1,
              "pitch": 1,
              "volume": 1,
              "font": "default",
              "delay": 0
          },
          "sound": {
              "file": "guitar",
              "volume": 1,
              "delay": 0,
              "pitch": 1
          },
          "click": {
              "kind": "launch",
              "name": "music",
              "predicate": "",
              "gesture": "select"
          },
          "content":[
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}}
          ]
      },
      {
          "appearance": "soundtext",
          "image": "images/argyle.jpg",
          "focus": 0,
          "title": {
              "text": "Date Time",
              "sex": "default",
              "speed": 1,
              "pitch": 1,
              "volume": 100,
              "font": "default",
              "delay": 0
          },
          "sound": {
              "file": "park",
              "volume": 100,
              "delay": 0,
              "pitch": 1
          },
          "hover": {
              "kind": "tell",
              "name": "content",
              "predicate": "time",
              "gesture": "select"
          },
          "click": {
              "kind": "tell",
              "name": "content",
              "predicate": "daytime",
              "gesture": "select"
          },
          "content":[
          	{"image":"images/greek.jpg","title":{"text":"SI"}},
          	{"image":"images/ramadan.jpg","title":{"text":"DO"}}
          ]

      },
      {
          "appearance": "soundtext",
          "image": "images/blobs.jpg",
          "focus": 0,
          "title": {
              "text": "Weather",
              "sex": "default",
              "speed": 1,
              "pitch": 1,
              "volume": 100,
              "font": "default",
              "delay": 0
          },
          "sound": {
              "file": "lake",
              "volume": 100,
              "delay": 0,
              "pitch": 1
          },
          "hover": {
              "kind": "tell",
              "name": "content",
              "predicate": "weather",
              "gesture": "select"
          },
          "click": {
              "kind": "tell",
              "name": "content",
              "predicate": "fullweather",
              "gesture": "select"
          },
          "content":[
          	{"image":"images/mexican.png","title":{"text":"ONE"}},
          	{"image":"images/bollywood.jpg","title":{"text":"TWO"}},
          	{"image":"images/flower.jpg","title":{"text":"THREE"}},
          	{"image":"images/flowers2.jpg","title":{"text":"FOUR"}}
          ]
      },
      {
          "appearance": "soundtext",
          "image":"images/carpet.jpg",
          "focus": 0,
          "title": {
              "text": "Configuration",
              "sex": "default",
              "speed": 1,
              "pitch": 1,
              "volume": 1,
              "font": "default",
              "delay": 0
          },
          "sound": {
              "file": "bubbling",
              "volume": 1,
              "delay": 0,
              "pitch": 1
          },
          "click": {
              "kind": "launch",
              "name": "config",
              "predicate": "",
              "gesture": "select"
          },
          "content":[
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}},{"title":{"text":"XXX"}},{"title":{"text":"YYY"}},
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}},{"title":{"text":"XXX"}},{"title":{"text":"YYY"}}
          ]
      }
      
  ]
	}];
}