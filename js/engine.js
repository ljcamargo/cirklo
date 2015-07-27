
var json;
var items;
var count;
var canvas;
var w;
var h;
var context;
var measures;
var constants;
var level = 0;

$( document ).ready(function() {
	init();
    start();
    redraw();
});

$( window ).resize(function() {
	init();
  	redraw();
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
}

function start() {
	json = getJson()[0];
	items = json.items;
	count = items.length;
	console.log("items count:" + items.length);	
}

function redraw() {
	measures.center.x = $(window).scrollLeft() + $(window).width() / 2;
	measures.center.y = $(window).scrollTop() + $(window).height() / 2;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context = canvas.getContext('2d'); 
	context.clearRect(0, 0, canvas.width, canvas.height);
	$('#viewport').empty();

	context.fillStyle="#DDD";
	context.fillRect(0,0, canvas.width, canvas.height);

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var origin = getElementRadialLocation(count, i, 0, constants.item.radius);
		drawElement(origin.top, origin.left, item.title.text, i, count);
		drawElementBackground(measures.center.x, measures.center.y, 1200, i, count);
	};

	drawElement(measures.center.y, measures.center.x, "start");
	drawPolygonCenterElementBackground(measures.center.x, measures.center.y, constants.kern.radius, count);
}

function redrawEvolve(color) {
	context.fillStyle=color;
	context.fillRect(0,0, canvas.width, canvas.height);
}

function getElementRadialLocation(count, index, weight, radius) {
	var angle = index * 2 * Math.PI / count;
	var y = radius * Math.sin(angle);
	var x = radius * Math.cos(angle);
	var _top = measures.center.y - y;
	var _left = x + measures.center.x;
	return {top:_top,left:_left};
}

function getElementSemiRadialLocation(count, index, weight, radius) {
	var angle = index * 2 * Math.PI / count;
	var semi = Math.PI / count;
	angle = angle - semi;
	var y = radius * Math.sin(angle);
	var x = radius * Math.cos(angle);
	var _top = measures.center.y - y;
	var _left = x + measures.center.x;
	return {top:_top, left:_left};
}


function drawElement (top, left, _text, index, count) {
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
		$('<p>').text(_text).css(
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
	).click(function(){
		evolveTo(this, index, count, top, left);
	});
}

function evolveTo(item, index, count, top, left) {
	var color = getRadialColor(index, count);
	
	$(item).siblings().hide("fast", function(){
		redrawEvolve(color);
		$(item).animate(
			{
				top: measures.center.y - constants.item.semiheight,
				left: measures.center.x - constants.item.semiwidth,
			},
			"fast"
		);
	});
}

function drawCenterElementBackground(x, y, r, c) {
	var color = getRadialColor(-1, c);
	context.beginPath();
	context.arc(x, y, r, 0, 2 * Math.PI, false);
	context.fillStyle = color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = color;
	context.stroke();
}

function drawPolygonCenterElementBackground(x, y, r, c) {
	var color = getRadialColor(-1, c);
	context.lineWidth = 5;
	context.strokeStyle = color;
	context.fillStyle = color;
	context.beginPath();
	for (var i = 0; i <= c; i++) {
		var origin = getElementSemiRadialLocation(count, i, 0, r);
		if (i == 0) {
			context.moveTo(origin.left, origin.top);
		} else {
			context.lineTo(origin.left, origin.top);
		}
	};
	context.fill();
	context.stroke();
}

function drawElementBackground(x, y, r, i, c) {
	var color = getRadialColor(i,c); 
	var semi = Math.PI / c;
	var starta = (i * 2 * Math.PI / c) - semi;
	var enda = ((i+1) * 2 * Math.PI / c) - semi;
	context.lineWidth = 1;
	context.strokeStyle = color;
	context.fillStyle = color;
	context.beginPath();
	context.moveTo(x,y);
	context.arc(x, y, r, starta, enda, false);
	context.lineTo(x,y);
	context.fill();

	context.stroke();
}

function getRadialColor(index, count) {
	if (index < 0) { return "white"; }
    var h = index * 240 / (count-1);
    return 'hsl(' + h + ',90%,40%)';
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
  "items": [
        {
          "appearance": "soundtext",
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
          }
      },
      {
          "appearance": "soundtext",
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
          }
      },
      {
          "appearance": "soundtext",
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
          }
      },
      {
          "appearance": "soundtext",
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
          }
      },
      {
          "appearance": "soundtext",
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
          }
      },
      {
          "appearance": "soundtext",
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
          }
      }
      
  ]
	}];
}