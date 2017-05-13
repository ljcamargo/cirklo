
$(window).resize(function() {
	cirklo.reinit();
});

var cirklo = {
	json: null,
	items: null,
	target: null,
	canvas: null,
	tanvas: null,
	context: null,
	stack: [],
	frags: [],

	constants: {
		extent: { radius: 1200 },
		canvas: {  },
		item: { width:200, height:200, radius: 300, semiwidth:100, semiheight:100 },
		kern: { width:200, height:200, radius: 150, semiwidth:100, semiheight:100 }
	},
	
	measures: {
		viewport: {},
		center: {}
	},

	init: function(target, json) {
		cirklo.json = json;
		cirklo.items = cirklo.json.content;
		cirklo.frags.push(cirklo.items.length);
		cirklo.target = target;
		cirklo.interface.start();
	},

	reinit: function() {
		cirklo.init(cirklo.target, cirklo.json);
	},

	interface: {
		start: function()  {
			$(cirklo.target).empty();
		    var $canvas = $("<canvas>", {id:"underCanvas", class:"ck-canvas"});
		    var $tanvas = $("<canvas>", {id:"upperCanvas", class:"ck-canvas"});
		    var $viewport = $("<div>", {id:"viewport", class:"ck-div"});
		    $(cirklo.target).append($canvas);
		    $(cirklo.target).append($tanvas);
		    $(cirklo.target).append($viewport);
			cirklo.canvas = $canvas[0];
			cirklo.tanvas = $tanvas[0];
			cirklo.interface.background();
	  		cirklo.interface.elements();
		},

		background: function() {
			var litems = cirklo.data.lastBranch();	
			var parent = cirklo.data.lastParent();

			cirklo.draw.prepare();
			cirklo.dom.loadAllImages(litems, function(images) {
				for (var index = 0; index < litems.length; index++) {
					var item = litems[index];
					var image = images[index];
					var extent = parent.extent || cirklo.constants.extent.radius;
					var color = item.color || parent.color;
					//cirklo.draw.backgroundElement(cirklo.measures.center.x, cirklo.measures.center.y, extent, index, litems.length, image, color);
					cirklo.draw.synapseElement(cirklo.measures.center.x, cirklo.measures.center.y, extent, index, litems.length, image, color);
				};

				cirklo.dom.loadImage(parent, function(image){
					var radius = parent.radius || cirklo.constants.kern.radius;
					//cirklo.draw.centerElement(cirklo.measures.center.x, cirklo.measures.center.y, radius, litems.length, image);
				});
				
			});	
		},

		elements: function(will, item) {
			if (will != -1) {
				$('#viewport').empty();
			} else {
				$(item).siblings().remove();
			}
			
			var litems = cirklo.data.lastBranch();
			var parent = cirklo.data.lastParent();

			cirklo.interface.element(parent, -1, -1);
			$(item).remove();
			
			for (var index = 0; index < litems.length; index++) {
				if (will != index) {
					var item = litems[index];
					cirklo.interface.element(item, index, 1);
				}
			};
		},

		element: function(item, index, time) {
			var origin = cirklo.geometry.radialLocation(cirklo.data.last(cirklo.frags), index);
			var top = origin.top;
			var left = origin.left;

			if (item.title) {
				var titleText = item.title.text || ""; 	
				var titleElement = cirklo.dom.inflator(item.title,
					$('<span>').text(titleText).css(
						{
							width: cirklo.constants.item.width
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
				var iconElement = cirklo.dom.inflator(item.icon,
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
					width: cirklo.constants.item.width
				});

			if (iconPosition == "right") {
				radial.append(titleElement).append(iconElement);
			} else {
				radial.append(iconElement).append(titleElement);
			}
				

			$('<div>').appendTo('#viewport').css(
				{
					position: 'absolute', 
					top: cirklo.measures.center.y - cirklo.constants.item.semiheight,
					left: cirklo.measures.center.x - cirklo.constants.item.semiwidth,
					width: cirklo.constants.item.width,
					height: cirklo.constants.item.height,
					opacity: 0,
					zIndex: 100
				}
			).append(radial).animate(
				{
					opacity: 1,
					top: top - cirklo.constants.item.semiheight,
					left: left - cirklo.constants.item.semiwidth,
				},
				"fast"
			).click(function(){ cirklo.interaction.click(time, this, index) });
		},

		transition: function(item, index, length) {
			var origin = cirklo.geometry.radialLocation(length, index);
			var final_top = origin.top - cirklo.constants.item.semiheight;
			var final_left = origin.left - cirklo.constants.item.semiwidth;
			var animation = { top: final_top, left: final_left };

			$(item).stop().siblings().hide("fast", function(){
				$(item).stop().animate(animation, "fast",
					function() {
						cirklo.interface.background();
						cirklo.interface.elements(index, item);
					}
				);
			});
		}

	},

	data: {
		itemChild: function(items) {
			if(items && items.content && items.length >0 ) {
				return item.content;
			}
		},

		itemsAtLevel: function(index, level) {
			if (items && items.length > 0) {
				if (level == 0) {
					return items;
				} else if (level > 0) {
					var lastchild = items;
					for (var i = 0; i <= level; i++) {
						if(lastchild && lastchild.content && lastchild.length > 0) {
							lastchild = lastchild.content;
						} else {
							lastchild = null;
						}
					}
					return lastchild;
				}
			}
		},

		lastBranch: function() {
			var last = cirklo.json;
			if (cirklo.stack.length>0) {
				for (var i = 0; i < cirklo.stack.length; i++) {
					last = cirklo.data.content(last);
					last = last[cirklo.stack[i]];
				};
			}
			return cirklo.data.content(last);
		},

		lastParent: function() {
			if (cirklo.stack.length == 0) {
				return cirklo.json;
			} else {
				var last = cirklo.items;
				for (var i = 0; i < cirklo.stack.length; i++) {
					if (i>0) last = cirklo.data.content(last);
					last = last[cirklo.stack[i]];
				};
				return last;
			}
		},

		futureItems: function(_index) {
			var _level = cirklo.stack.length;
			if (cirklo.items && cirklo.items.length > 0) {
				var lastchild = cirklo.data.lastBranch();
				return cirklo.data.content(lastchild[_index]);
			}
		},

		content: function(branch) {
			if (branch && branch.content && branch.content.length > 0) {
				return branch.content;
			}
		},

		move: function(time, will) {
			if (time > 0) { //FUTURE
				var future = cirklo.data.futureItems(will);
				if (future == null) return;
				cirklo.stack.push(will);
				cirklo.frags.push(future.length);
				return true;
			} else if (time < 0) { //PAST
				if (cirklo.stack.length<1) return;
				var past_index = cirklo.stack.pop();
				var past_length = cirklo.frags.pop(); 
				return true;
			}
		},

		navigate: function(time, item, index) {
			if (!cirklo.data.move(time, index)) return;
			var lastIndex = (time > 0) ? cirklo.stack[cirklo.frags.length-1] : -1;
			var lastLength = cirklo.data.last(cirklo.frags);
			cirklo.interface.transition(item, lastIndex, lastLength);
		},

		last: function(array) {
			return array[array.length -1];
		}

	},

	geometry: {

		radialLocation: function(count, index, radius, offset) {
			radius = radius || cirklo.constants.item.radius;
			offset = offset || 0;
			var angle = (index * 2 * Math.PI / count) + (offset*(Math.PI/180));
			var y = (index >= 0) ? (radius * Math.sin(angle)) : 0;
			var x = (index >= 0) ? (radius * Math.cos(angle)) : 0;
			var _top = cirklo.measures.center.y - y;
			var _left = x + cirklo.measures.center.x;
			return {top:_top,left:_left};
		},

		semiRadialLocation: function(count, index, radius) {
			var angle = index * 2 * Math.PI / count;
			var semi = Math.PI / count;
			angle = angle - semi;
			var y = radius * Math.sin(angle);
			var x = radius * Math.cos(angle);
			var _top = cirklo.measures.center.y - y;
			var _left = x + cirklo.measures.center.x;
			return {top:_top, left:_left};
		}
	},

	draw: {
		prepare: function() {
			cirklo.measures.center.x = $(window).scrollLeft() + $(window).width() / 2;
			cirklo.measures.center.y = $(window).scrollTop() + $(window).height() / 2;
			cirklo.canvas.width = window.innerWidth;
			cirklo.canvas.height = window.innerHeight;
			cirklo.tanvas.width = window.innerWidth;
			cirklo.tanvas.height = window.innerHeight;
			cirklo.context = cirklo.canvas.getContext('2d');
			cirklo.tontext = cirklo.tanvas.getContext('2d'); 
			cirklo.context.clearRect(0, 0, cirklo.canvas.width, cirklo.canvas.height);
			cirklo.tontext.clearRect(0, 0, cirklo.tanvas.width, cirklo.tanvas.height);
			cirklo.context.fillStyle = "#DDD";
			cirklo.context.fillRect(0,0, cirklo.canvas.width, cirklo.canvas.height);
			cirklo.tontext.fillStyle = "#000";
			cirklo.tontext.fillRect(0,0, cirklo.tanvas.width, cirklo.tanvas.height);
			//$(cirklo.tanvas).css('opacity','0');
		},

		centerElement: function(x, y, radius, count, image) {
			var color = cirklo.draw.radialColor(-1, count);
			var fill = color ;
			if (image != null) fill = cirklo.context.createPattern(image,'repeat');
			cirklo.context.lineWidth = 5;
			cirklo.context.strokeStyle = color;
			cirklo.context.fillStyle = fill;
			cirklo.context.beginPath();
			if (count > 2) {
				for (var i = 0; i <= count; i++) {
					var origin = cirklo.geometry.semiRadialLocation(count, i, radius);
					if (i == 0) {
						cirklo.context.moveTo(origin.left, origin.top);
					} else {
						cirklo.context.lineTo(origin.left, origin.top);
					}
				};
			} else {
				cirklo.context.arc(x, y, radius, 0, 2 * Math.PI, false);
			}
			cirklo.context.fill();
		},

		backgroundElement: function(x, y, radius, index, count, image, color) {
			var _color = color || cirklo.draw.radialColor(index,count); 
			var semi = Math.PI / count;
			var starta = (index * 2 * Math.PI / count) - semi;
			var enda = ((index + 1) * 2 * Math.PI / count) - semi;
			starta = (2 * Math.PI) - starta; 
			enda = (2 * Math.PI) - enda;

			if (image != null) {
				var pattern = cirklo.context.createPattern(image,'repeat');
				cirklo.draw.arc(x, y, radius, starta, enda, _color, pattern);
			} else {
				cirklo.draw.arc(x, y, radius, starta, enda, _color, _color);
			}
		},

		synapseElement: function(x, y, radius, index, count, image, color) {
			var parent = cirklo.data.lastParent();
			//var _color = color || cirklo.draw.radialColor(index,count); 
			//_color = cirklo.draw.radialColor(index,count);
			var synapse = parent.synapse || {};
			var step = synapse.step || 10;
			var maxItemRadius = synapse.maxRadius || 30;
			var minItemRadius = synapse.minRadius || 15;
			var maxPower = synapse.maxPower || 20.0;
			var minPower = synapse.minPower || 0.0;
			radius = cirklo.constants.item.radius;
			var desv = 0;
			for (var i = 0; i < radius; i+=step) {
				var rnd = Math.random() - 0.5;
				var ratio = (i / radius);
				var sratio = Math.sin(Math.PI * 0.5 * ratio);
				var power = maxPower - (sratio *  (maxPower - minPower));
				var itemRadius = maxItemRadius - (ratio *  (maxItemRadius - minItemRadius));
				var locus = cirklo.geometry.radialLocation(count, index, i, desv*power);
				var color = cirklo.draw.radialColor(index, count, null, 1, sratio, sratio); 
				cirklo.draw.circle(locus.left, locus.top, itemRadius, color, color);
				desv += rnd;
			}
		},

		circle: function(x, y, radius, stroke, fill) {
			cirklo.draw.arc(x, y, radius, 0, 2 * Math.PI, stroke, fill);
		}, 

		arc: function(x, y, radius, start, end, stroke, fill) {
			cirklo.context.lineWidth = 0;
			cirklo.context.strokeStyle = stroke;
			cirklo.context.fillStyle = fill;
			cirklo.context.beginPath();
			cirklo.context.moveTo(x, y);
			cirklo.context.arc(x, y, radius, start, end, true);
			cirklo.context.lineTo(x, y);
			cirklo.context.fill();
		},

		radialColor: function(_index, _count, tonalW, hRatio, sRatio, lRatio) {
			hRatio = hRatio || 1; sRatio = sRatio || 1; lRatio = lRatio || 1;
			tonalw = tonalW || cirklo.draw.levelTonalWidth();
			if (_index < 0) { return tonalw.kern; }
		    var h = ((_index * tonalw.depth / (_count-1)) + tonalw.base) * hRatio;
		    var s = tonalw.sat * sRatio;
		    var l = tonalw.light * lRatio;
		    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
		},

		levelTonalWidth: function(fLength, sLength) {
			fLength = fLength ? fLength : cirklo.frags.length;
			sLength = sLength ? sLength : cirklo.stack.length;
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

			_sat = _sat + (satstep * fLength);
			_light = _light + (lightstep * fLength);

			if (sLength != 0) {
				for (var i = 0; i < fLength-1; i++) {
					var lale = cirklo.frags[i];
					var lali = cirklo.stack[i];
					var slice = 1 / (lale + 2);
					var plice = 1 / lale;
					pepth = plice * pepth;
					dase = (lali * pepth) + dase;
					_depth = slice * _depth;
					_base = (lali * _depth) + _base;
					if (i == fLength - 2) {
						var h = dase;
						_kern = 'hsl(' + h + ',' + s + '%,' + l + '%)';
					}
				};
			}

			return {base:_base, depth:_depth, sat:_sat, light:_light, kern:_kern};
		}

	},

	dom: {
		inflator: function(item, $object) {
			var itemStyle = item.style? item.style : {};
			var itemClass = item.class? item.class : "";
			$object
				.css(itemStyle)
				.addClass(itemClass)
			return $object;
		},

		loadAllImages: function(items, callback) {
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
		},

		loadImage: function(item, callback) {
			console.log("cirklo.dom.loadImage");
			var imageSrc = item.image;
			if (imageSrc != null) {
				var image = new Image();
				image.onload = function() {
					callback(image);
				};
				image.onerror = function() {
					callback();
				};
				image.src = imageSrc;
			} else {
				callback();
			}
		}
	},

	interaction: {
		openInNewTab: function(url) {
		  var win = window.open(url, '_blank');
		  win.focus();
		},

		click: function(time, item, index) {
			var _item = cirklo.data.lastBranch()[index];
			if (_item && _item.contentLink) {
				cirklo.interaction.openInNewTab(_item.contentLink);
			} else {
				cirklo.data.navigate(time, item, index);
			}
		}
	}
}