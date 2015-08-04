
var json;
var items;
var ___count;
var canvas;
var tanvas;
var w;
var h;
var context;
var measures;
var constants;
var level = 0;
var focus = 0;
var stack = []; //STACK of indexes been choose
var frags = []; //Stack of lengths of levels been choose
var parental;
var debugSplice = 6;

$( document ).ready(function() {
	init();
    start();
  	redrawBackground();
  	redrawElements();
});

$( window ).resize(function() {
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
	console.log("items count:" + items.length);	
	console.log("items counj:" + json.content.length);
}

function redrawBackground() {
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

	for (var index = 0; index < litems.length; index++) {
		drawElementBackground(measures.center.x, measures.center.y, 1200, index, litems.length);
	};

	drawCenterElementBackground(measures.center.x, measures.center.y, constants.kern.radius, litems.length);
}

function redrawElements(except_index, except_item) {
	if (except_item == undefined) {
		$('#viewport').empty();
	} else {
		$(except_item).siblings().remove();
		$(except_item).click(function(){evolveTo});
	}
	
	var litems = getLastBranch();
	var parent = getLastParent();
	
	for (var index = 0; index < litems.length; index++) {
		if (except_index != index) {
			var item = litems[index];
			var origin = getElementRadialLocation(litems.length, index, 0, constants.item.radius);
			drawElement(origin.top, origin.left, item.title.text, index, litems.length, evolveTo);
		}
	};
	
	drawElement(measures.center.y, measures.center.x, parent.title.text, -1, litems.length, involveTo);
}

function redrawEvolve(color) {
	tontext.fillStyle = color;
	tontext.fillRect(0,0, tanvas.width, tanvas.height);
	$(tontext).fadeIn("slow",1, function(){
		context.fillStyle = color;
		context.fillRect(0,0, canvas.width, canvas.height);
		redrawBackground();
		redrawElements();
	});
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


function drawElement (top, left, _text, index, count, _click) {
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
	).click(function(){_click(this, index, count, top, left)});
}

function getItemChild(_items) {
	if(_items && _items.content && _items.length >0 ) {
		return _item.content;
	}
}

function getItemsAtLevel(_index, _level) {
	if (items && items.length > 0) {
		if (_level == 0) {
			return items;
		} else if (_level > 0) {
			var lastchild = items;
			for (var i = 0; i <= _level; i++) {
				if(lastchild && lastchild.content && lastchild.length > 0) {
					console.log("_level has content "+_level);
					lastchild = lastchild.content;
				} else {
					console.log("_level has NO content "+_level);
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

function getNextItems(_index) {
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

function evolveTo(item, index, count, top, left) {
	var upperitems = getNextItems(index);
	if (upperitems != null) {
		stack.push(index);
		frags.push(upperitems.length);
		var color = getRadialColor(index, count);
		$(item).siblings().hide("fast", function(){
			$(item).stop().animate(
				{
					top: measures.center.y - constants.item.semiheight,
					left: measures.center.x - constants.item.semiwidth,
				},
				"fast",
				function() {
					redrawEvolve(color);
				}
			);
		});
	} else {
		console.log("no upper items");
	}	
}

function involveTo(item, index, count, top, left) {
	var lastindex = stack.pop();
	var lastlength = frags.pop(); lastlength = frags[frags.length-1];
	console.log("radial location for length "+lastlength+" index "+lastindex);
	var origin = getElementRadialLocation(lastlength, lastindex, 0, constants.item.radius);
	var top = origin.top;
	var left = origin.left;
	var item$ = $(item);
	
	$(item).stop().siblings().hide("fast", function(){
		//$(item).stop().hide("fast", function(){
			//redrawElements(index, item);
			//redrawBackground();

		//});

		
		$(item).stop().animate(
		{
			opacity: 1,
			top: top - constants.item.semiheight,
			left: left - constants.item.semiwidth,
		},
		"fast",
		function() {
			redrawElements(lastindex, item);
			redrawBackground();
		});
		
	});

	
}

function drawCenterElementBackground(x, y, r, c) {
	var color = getRadialColor(-1, c);
	context.lineWidth = 5;
	context.strokeStyle = color;
	context.fillStyle = color;
	context.beginPath();
	if (c > 2) {
		for (var i = 0; i <= c; i++) {
			var origin = getElementSemiRadialLocation(c, i, 0, r);
			if (i == 0) {
				context.moveTo(origin.left, origin.top);
			} else {
				context.lineTo(origin.left, origin.top);
			}
		};
	} else {
		context.arc(x, y, r, 0, 2 * Math.PI, false);
	}
	context.fill();
	context.stroke();
}

function drawElementBackground(x, y, r, i, c) {
	var color = getRadialColor(i,c); 
	var semi = Math.PI / c;
	var starta = (i * 2 * Math.PI / c) - semi;
	var enda = ((i+1) * 2 * Math.PI / c) - semi;
	starta = (2* Math.PI) - starta; 
	enda = (2*Math.PI) - enda;
	context.lineWidth = 0;
	context.strokeStyle = color;
	context.fillStyle = color;
	context.beginPath();
	context.moveTo(x,y);
	context.arc(x, y, r, starta, enda, true);
	context.lineTo(x,y);
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
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}}
          ]

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
          },
          "content":[
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}},{"title":{"text":"XXX"}},{"title":{"text":"YYY"}}
          ]
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
          },
          "content":[
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}},{"title":{"text":"XXX"}},{"title":{"text":"YYY"}},
          	{"title":{"text":"SI"}},{"title":{"text":"DO"}},{"title":{"text":"XXX"}},{"title":{"text":"YYY"}}
          ]
      }
      
  ]
	}];
}