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
	},
	pointInRect = function(point, rect) {
		if ((point.x >= rect.origin.x) && (point.x < rect.origin.x + rect.size.width) &&
		    (point.y >= rect.origin.y) && (point.y < rect.origin.y + rect.size.height)) {
			return true;
		}
		return false;
	};
	
	var 	
	cols = 64,
	rows = 64,
	offset = Point(0, 0);
	tileMap = null,
	spriteMap = null,
	TILE_SIZE = 48,
	selectedTile = null,
	
	SpriteMap = Class.extend({
		init: function(url, width, height) {
			var _this = this;
			this.loaded = false;

			// sprite size, not image dimensions
			this.width = width;
			this.height = height;
			
			this.img = new Image();
			this.img.src = url;
			this.img.onload = function() {
				_this.loaded = true;
			};
		},
		draw: function(sx, sy, dx, dy) {
			if (!this.loaded) return;
			
			ctx.drawImage(this.img, sx * this.width, sy * this.height, this.width, this.height, dx, dy, this.width, this.height);
		}
	}),
	
	Tile = Class.extend({
		init: function(width, height) {
			this.type = 0;
			
			if (Math.round(Math.random() * 50) == 1) {
				this.type = 1;
			}
			
			this.size = Size(width, height);
			this.color = randomRGB();
		},
		render: function(x, y) {
			spriteMap.draw(this.type, 0, x, y);
			
			if ((mousePoint.x > -1 && mousePoint.y > -1) && pointInRect(mousePoint, Rect(x, y, this.size.width, this.size.height))) {
				selectedTile = this;
				ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
				ctx.fillRect(x, y, this.size.width, this.size.height);
				ctx.fill();
			}
		}
	}),
	
	TileMap = Class.extend({
		init: function() {
			this.tiles = new Array(rows);
			this.width = 25;
			this.height = 25;
			
			for (var y = 0; y < rows; y++) {
				this.tiles[y] = [];
				for (var x = 0; x < cols; x++) {
					this.tiles[y][x] = new Tile(TILE_SIZE, TILE_SIZE);
				}
			}
		},
		render: function() {
			for (var y = 0; y < rows; y++) {
				for (var x = 0; x < cols; x++) {

					if ((x * TILE_SIZE + offset.x >= -TILE_SIZE) && (x * TILE_SIZE + offset.x < canvas.width + TILE_SIZE) &&
						  (y * TILE_SIZE + offset.y >= -TILE_SIZE) && (y * TILE_SIZE + offset.y < canvas.height + TILE_SIZE)) {
						this.tiles[y][x].render(x * TILE_SIZE + offset.x, y * TILE_SIZE + offset.y);
					}
				}
			}
		}
	}),
	
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
		selectedTile = null;
	},
	
	mouseDown = function(e) {
		isMouseDown = true;
		
		if (selectedTile) selectedTile.color = randomRGB();
	},
	mouseUp = function(e) {
		isMouseDown = false;
	},
	
	MOVE_SPEED = 10,
	
	keyDown = function(e) {
		if (!(e.keyCode in {87: null, 83: null, 65: null, 68: null})) {
			return;
		}

		switch (e.keyCode) {
			case 87: // w
				offset.y += MOVE_SPEED;
				break;
			case 83: //s
				offset.y -= MOVE_SPEED;
				break;
			case 65: // a
				offset.x += MOVE_SPEED;
				break;
			case 68: // d
				offset.x -= MOVE_SPEED;
				break;
		}
		
		if (offset.x > 0) {
			offset.x = 0;
		} else if(offset.x < -(rows * TILE_SIZE) + canvas.width) {
			offset.x = -(rows * TILE_SIZE) + canvas.width;
		}
		
		if (offset.y > 0) {
			offset.y = 0;
		} else if (offset.y < -(cols * TILE_SIZE) + canvas.height) {
			offset.y = -(cols * TILE_SIZE) + canvas.height;
		}
		$('#stats').html('x: ' + offset.x + ' y: ' + offset.y);
		
	},
	
	keyUp = function(e) {
		
	},
	
	KEYS = {
		UP: 87, // w
		DOWN: 83, // s
		LEFT: 65, // a
		RIGHT: 68 // d
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
		tileMap.render();
	},
	
	MOVE_DELAY = 20,
	nextMove = MOVE_DELAY,
	
	moveRandom = function() {
		nextMove--;
		if (nextMove == 0) {
			var move = 2 + Math.floor(Math.random() * 10);
			
			switch(Math.floor(Math.random() * 4)) {
				case 0:
					offset.x += move;
					break;
				case 1:
					offset.y += move;
					break;
				case 2:
					offset.x -= move;
					break;
				case 3:
					offset.y -= move;
			};
			
			if (offset.x > 0) {
				offset.x = 0;
			} else if(offset.x < -(rows * TILE_SIZE) + canvas.width) {
				offset.x = -(rows * TILE_SIZE) + canvas.width;
			}
			
			if (offset.y > 0) {
				offset.y = 0;
			} else if (offset.y < -(cols * TILE_SIZE) + canvas.height) {
				offset.y = -(cols * TILE_SIZE) + canvas.height;
			}
			
			nextMove = MOVE_DELAY;
			$('#stats').html('x: ' + offset.x + ' y: ' + offset.y);
		}
	},
	
	mainLoop = function() {
		var now = arguments[0], taken;
		
		// for (var i = 0; i < bugs.length; i++) {
		// 	bugs[i].update();
		// }
		
		//moveRandom();
		// FIXME blarg
		draw();
		
		frames++;
		if (now - lastFrames > 1000) {
			$('#fps').html(frames);
			frames = 0;
			lastFrames = new Date();
		}
		
		// setTimeout(mainLoop, 10);
		window.requestAnimFrame(mainLoop, game[0]);
	};
	
	return {
		init: function() {
			if (game === null) {
				game = $('#screen');
				canvas = game[0];
				
				if (game[0].getContext) {
					// Use WebGL acceleration where available
					WebGL2D.enable(canvas);
					this.ctx = ctx = canvas.getContext('webgl-2d');
					if (ctx == null) {
						this.log('WebGL not supported. Falling back to standard mode.');
						this.ctx = ctx = canvas.getContext('2d');
					}
				} else {
					this.log('Your browser doesn\'t support <strong>&lt;canvas/&gt;</strong>! :(');
					return;
				}
			}
			
			// this.log('<span id="renderTime"></span>ms');
			this.log('<span id="fps">0</span> fps');
			this.log('<span id="stats"></span>');
			
			game.on('mousemove', mouseMoved);
			game.on('mouseout', mouseOut);
			game.on('mousedown', mouseDown);
			game.on('mouseup', mouseUp);
			
			$('body').on('keydown', keyDown);
			$('body').on('keyup', keyUp);
			
			spriteMap = new SpriteMap('spritemap.png', TILE_SIZE, TILE_SIZE);
			tileMap = new TileMap();
					
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