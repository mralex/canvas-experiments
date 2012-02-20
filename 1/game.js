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
	ctx = null,
	frames, lastFrame;
	
	log = function(msg) {
		$('#log ul').append('<li>' + msg + '</li>');
	},
	
	randomRGB = function() {
		var r = Math.floor(Math.random() * 100) + 100,
							g = Math.floor(Math.random() * 100) + 100,
							b = Math.floor(Math.random() * 100) + 100;
		// var r = g = b = 100;
		return 'rgb(' + r + ',' + g + ',' + b + ')'
	}
	
	draw = function() {
		var w = screenWidth / 15, h = w;
		now = new Date();

		for (var y = 0; y < 10; y++) {
			for (var x = 0; x < w; x++) {
				ctx.fillStyle = randomRGB();
				 //ctx.fillRect(screenWidth / 2 - 25, screenHeight / 2 - 25, 50, 50);
				ctx.fillRect(w * x, h * y, w, h);
			}
		}
		
		$('#renderTime').html('Render time: ' + ((new Date()) - now));
	},
	
	mainLoop = function() {
		var now = arguments[0], taken;
			
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
				
				if (game[0].getContext) {
					this.ctx = ctx = game[0].getContext('2d');
				} else {
					this.log('Your browser doesn\'t support <strong>&lt;canvas/&gt;</strong>! :(');
					return;
				}
			}
			
			this.log('<span id="renderTime"></span>ms');
			this.log('<span id="fps">0</span> fps');
			// game.css('width', screenHeight + 'px').css('height', screenHeight + 'px');
			
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