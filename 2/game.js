// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback, e ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var Game = (function($) {
	var screenWidth = 720,
	screenHeight = 480,
	game = null,
	canvas = null,
	ctx = null,
	frames, lastFrame, avgFps = 0, secondCount = 0,
	mousePoint = { x: -1, y: -1 },
	isMouseDown = false;
	
	var Point = function(x, y) {
		return {x: x, y: y};
	},
	Size = function(w, h) {
		return {width: w, height: h};
	}
	Rect = function(x, y, w, h) {
		return { origin: Point(x, y), size: Size(w, h) };
	};
	
	var Bug = Class.extend({
		init: function(i) {
			this.index = i;
			this.width = 10;
			this.height = 10;
			this.speed = 3;

			this.x = this.width + Math.floor(Math.random() * (canvas.width - (this.width * 2)));
			this.y = this.height + Math.floor(Math.random() * (canvas.height - (this.height * 2)));
			this.x2 = this.width + Math.floor(Math.random() * (canvas.width - (this.width * 2)));
			this.y2 = this.height + Math.floor(Math.random() * (canvas.height - (this.height * 2)));
			this.ox = this.x;
			this.oy = this.y;
			this.dx = this.x;
			this.dy = this.y;
			this.color = randomRGB();
		},
		setDestination: function(dx, dy) {
			this.dx = dx;
			this.dy = dy;
		},
		update: function() {
			if (mousePoint.x == -1 && mousePoint.y == -1) {
				return;
			}
			
			this.ox = this.x;
			this.oy = this.y
			
			var v = Point(this.x - mousePoint.x, this.y - mousePoint.y),
			distance = Math.sqrt(((v.x * v.x) + (v.y * v.y))),
			speed = (this.speed / (distance / 20)),
			mag,
			dest;
			
			if (distance < 10) speed = this.speed;
			
			// if (distance < 50) speed = -speed;
			
			mag = ((isMouseDown && speed > 0) ? -speed : speed) / distance;			
			dest = Point((mag * mousePoint.x + (1 - mag) * this.x), (mag * mousePoint.y + (1 - mag) * this.y));
			
			if (distance == 0) console.log("!!");
			// console.log(speed);
			
			this.x = dest.x;
			this.y = dest.y;
			
			//$('#stats').html('speed: ' + speed + ' distance: ' + distance + ' x: ' + this.x + ' y: ' + this.y);
			
			if (isNaN(this.x) || isNaN(this.y) || (this.x < 0) || (this.y < 0) || (this.x > canvas.width) || (this.y > canvas.height)) {
				// this.x = this.width + Math.floor(Math.random() * (canvas.width - (this.width * 2)));
				// 				this.y = this.height + Math.floor(Math.random() * (canvas.height - (this.height * 2)));
				this.x = this.ox;
				this.y = this.oy;
			}
		},
		render: function() {
			if (mousePoint.x >= 0 && mousePoint.y >= 0 && 0) {
				ctx.strokeStyle = '#bbb';
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(mousePoint.x, mousePoint.y);
				// ctx.closePath();
				ctx.stroke();
				ctx.closePath();
				
				// ctx.beginPath();
				// ctx.moveTo(mousePoint.x, mousePoint.y);
				// ctx.strokeStyle = '#f00';
				// ctx.lineTo(this.x2, this.y2);
				// ctx.stroke();
			}
			
			ctx.beginPath();
			ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
			ctx.closePath();
			ctx.fillStyle = this.color;// '#000';
			ctx.fill();
		}
	}),
	
	bugs = [],
	
	log = function(msg) {
		$('#log ul').append('<li>' + msg + '</li>');
	},
	
	randomRGB = function() {
		var r = Math.floor(Math.random() * 100) + 100,
							g = Math.floor(Math.random() * 100) + 100,
							b = Math.floor(Math.random() * 100) + 100;
		// var r = g = b = 100;
		return 'rgb(' + r + ',' + g + ',' + b + ')'
	},
	
	mouseMoved = function(e) {
		var pos = Point(e.pageX - canvas.parentElement.offsetLeft, e.pageY - canvas.parentElement.offsetTop);
		if (!$('#pos')[0]) {
			log('<span id="pos"></span>');
		}
		$('#pos').html('{ ' + pos.x + ', ' + pos.y + ' }');
		mousePoint = pos;
	},
	
	mouseOut = function(e) {
		mousePoint = Point(-1, -1);
	},
	
	mouseDown = function(e) {
		isMouseDown = true;
	},
	mouseUp = function(e) {
		isMouseDown = false;
	},
	
	draw = function() {
		var w = screenWidth / 15, h = w;
		
		// for (var y = 0; y < 10; y++) {
		// 			for (var x = 0; x < w; x++) {
		// 				ctx.fillStyle = randomRGB();
		// 				 //ctx.fillRect(screenWidth / 2 - 25, screenHeight / 2 - 25, 50, 50);
		// 				ctx.fillRect(w * x, h * y, w, h);
		// 			}
		// 		}
		// ctx.fillStyle = 'white';
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		for (var i = 0; i < bugs.length; i++) {
			bugs[i].render();
		}
		
	},
	
	mainLoop = function() {
		var now = arguments[0], taken;
		
		for (var i = 0; i < bugs.length; i++) {
			bugs[i].update();
		}
		
		draw();
		
		frames++;
		if (now - lastFrames > 1000) {
			$('#fps').html(frames);
			frames = 0;
			lastFrames = new Date();
		}
		
		window.requestAnimFrame(mainLoop, game[0]);
	};
	
	return {
		init: function() {
			if (game === null) {
				game = $('#screen');
				canvas = game[0];
				
				if (game[0].getContext) {
					this.ctx = ctx = game[0].getContext('2d');
				} else {
					this.log('Your browser doesn\'t support <strong>&lt;canvas/&gt;</strong>! :(');
					return;
				}
			}
			
			this.log('<span id="renderTime"></span>ms');
			this.log('<span id="fps">0</span> fps. (<span id="avgFps">0</span> avg)');
			this.log('<span id="stats"></span>');
			// game.css('width', screenHeight + 'px').css('height', screenHeight + 'px');
			
			game.on('mousemove', mouseMoved);
			game.on('mouseout', mouseOut);
			game.on('mousedown', mouseDown);
			game.on('mouseup', mouseUp);
			
			for (var i = 0; i < 10; i++) {
				bugs.push(new Bug(i));
			}
			
			draw();
			
			// setInterval(draw, Math.floor(1000 / 30));
			
			frames = 0;
			lastFrames = new Date();
			mainLoop();
		},
		log: log,
		ctx: ctx
	};
}(jQuery));

$(function() {
});