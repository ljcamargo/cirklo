
var json;
var items;
var canvas;
var tanvas;
var w;
var h;
var context;
var measures;
var constants;
var stack = [];
var frags = [];

$(window).resize(function() {
	if (json == undefined) return;
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
    constants.extent = {radius: 1200}
    constants.item = {width:200, height:200, radius: 300, semiwidth:100, semiheight:100};
    constants.kern = {width:200, height:200, radius: 150, semiwidth:100, semiheight:100};
	canvas = $('#miCanvas')[0];
	tanvas = $('#miTanvas')[0];
}

function start(object) {
	this.json = object;
	this.items = json.content;
	this.frags.push(items.length);
	init();
  	redrawBackground();
  	redrawElements();
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

	context.fillStyle = "#DDD";
	context.fillRect(0,0, canvas.width, canvas.height);
	tontext.fillStyle = "#000";
	tontext.fillRect(0,0, tanvas.width, tanvas.height);

	var litems = getLastBranch();	
	var parent = getLastParent();

	loadAllImages(litems, function(images) {
		console.log("loadAllImages did");
		for (var index = 0; index < litems.length; index++) {
			var item = litems[index];
			var image = images[index];
			var extent = parent.extent || constants.extent.radius;
			drawElementBackground(measures.center.x, measures.center.y, extent, index, litems.length, image);
		};
		console.log("drawElementBackground did");

		loadImage(parent, function(image){
			console.log("loaded image for center "+image);
			var radius = parent.radius || constants.kern.radius;
			drawCenterElementBackground(measures.center.x, measures.center.y, radius, litems.length, image);
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

	drawElement(parent, -1, -1);
	$(item).remove();
	
	for (var index = 0; index < litems.length; index++) {
		if (will != index) {
			var item = litems[index];
			drawElement(item, index, 1);
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

function objectInflator(item, $object) {
	var itemStyle = item.style? item.style : {};
	var itemClass = item.class? item.class : "";
	$object
		.css(itemStyle)
		.addClass(itemClass)
	return $object;
}

function drawElement(item, index, time) {
	var origin = getRadialLocation(last(frags), index);
	var top = origin.top;
	var left = origin.left;

	if (item.title) {
		var titleText = item.title.text || ""; 	
		var titleElement = objectInflator(item.title,
			$('<span>').text(titleText).css(
				{
					width: constants.item.width
				}
			)
		);
	}

	if (item.icon) {
		var iconImage = item.icon.image || "";
		var iconPosition = item.icon.position || "left";
		var iconLeft = (iconPosition == "left") ? "0px" : "auto";
		var iconTransform = "translateY(-50%);";
		if (titleElement == undefined) {
			iconLeft = "50%",
			iconTransform = "translateX(-50%) translateY(-50%)";
		}
		var iconElement = objectInflator(item.icon,
			$('<img>').attr("src", iconImage).css(
				{
					left: iconLeft,
					transform: iconTransform
				}
			)
		);
	}

	var itemClass = index < 0 ? "kern" : "radial";
	var radial = $('<div>').addClass(itemClass).css({
			width: constants.item.width
		});

	if (iconPosition == "right") {
		radial.append(titleElement).append(iconElement);
	} else {
		radial.append(iconElement).append(titleElement);
	}
		

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
	).append(radial).animate(
		{
			opacity: 1,
			top: top - constants.item.semiheight,
			left: left - constants.item.semiwidth,
		},
		"fast"
	).click(function(){ nav(time, this, index) });
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

function navData(time, will) {
	// TIME > 0 equals future
	// TIME < 0 equals past

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

function nav(time, item, index) {

	if (!navData(time, index)) return;

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
