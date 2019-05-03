"use strict";

/**
 * Behandelt das Verschieben und Schliessen des Fensters
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

_.addToStart(function() {
	var close = _.id('close');
	
	_.event(close, 'click', function() {
		fenster.close();
	});
	_.event(close, 'mouseover', function() {
		var lines = close.getElementsByTagName('line'), i;
		
		for(i=0;i<2;++i) {
			lines[i].__old_style__ = lines[i].style.cssText;
			
			lines[i].style.cssText += 'stroke:#491786;stroke-width:3;';
		}
	});
	_.event(close, 'mouseout', function() {
		var lines = close.getElementsByTagName('line'), i;
		
		for(i=0;i<2;++i) {
			if(lines[i].__old_style__ !== undefined) {
				lines[i].style.cssText = lines[i].__old_style__;
			}
		}
	});
	
	var title = _.id('projektName').getElementsByTagName('h1')[0];
	
	_.event(title, 'mousedown', function(event) {
		fenster.fullscreen(false);
		
		window.setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 0);
		
		var x = event.screenX, y = event.screenY, posX = fenster.getX(), posY = fenster.getY();
		
		var action = function(event) {
			if(x === event.screenX && y === event.screenY) {
				return;
			}
			
			fenster.setX(posX + event.screenX - x);
			fenster.setY(posY + event.screenY - y);
		};
		
		// Pruefe die Position des Objektes und aendere dessen Groesse, falls es den oberen Rand beruehrt
		action.finished = function(event) {
			if(event.screenY < 5) {
				if(event.screenX < 100) {
					fenster.setX(0);
					fenster.setY(0);
					
					fenster.resizeTo(parseInt(window.screen.width / 2), window.screen.availHeight);
				} else if(event.screenX > window.screen.width - 100) {
					fenster.resizeTo(window.screen.width / 2, window.screen.availHeight);
					
					fenster.setY(0);
					fenster.setX(window.screen.width - fenster.getWidth());
				} else {
					fenster.fullscreen();
				}
				
				window.setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 0);
			}
		};
		
		_.movable(title, action);
	});
	
	_.event(title, 'dblclick', function(event) {
		fenster.toggleFullscreen();
	});
});