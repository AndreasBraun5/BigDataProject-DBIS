"use strict";

/**
 * Wrapperobjekt fuer das Fenster
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	var nw = require('nw.gui');
	
	var window = nw.Window.get();
	
	var _ = function() {
		
	};
	
	root[name] = _;
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	var events = {'close': {'actions': {}, 'nr': 0}};
	
	var lastCoords = {'x': 0, 'y': 0};
	
	_.resizeTo = function(width, height) {
		return window.resizeTo.apply(window, arguments);
	};
	_.resizeBy = function(width, height) {
		return window.resizeBy.apply(window, arguments);
	};
	_.show = function(is_show) {
		return window.show.apply(window, arguments);
	};
	_.hide = function() {
		return window.hide();
	};
	_.setX = function(x) {
		window.x = x;
	};
	_.setY = function(y) {
		window.y = y;
	};
	_.getX = function() {
		return window.x;
	};
	_.getY = function() {
		return window.y;
	};
	_.getWidth = function() {
		return window.width;
	};
	_.getHeight = function() {
		return window.height;
	};
	
	/**
	 * Schliesst das Fenster und fuehrt vorher die Funktionen aus, die hinterlegt wurden
	 **/
	_.close = function(force) {
		window.hide();
		
		var i;
		
		for(i in events.close.actions) {
			try {
				events.close.actions[i]();
			} catch(e) {}
		}
		
		window.close.apply(this, arguments);
		
		nw.App.quit();
	};
	_.toggleFullscreen = function() {
		window.toggleFullscreen();
	};
	_.fullscreen = function(toFullscreen) {
		if(toFullscreen === undefined || toFullscreen === true) {
			window.enterFullscreen();
		} else {
			window.leaveFullscreen();
		}
	};
	
	function stopEvent(event, nr) {
		this.stop = function() {
			delete events[event].actions['_' + nr];
		}
	}
	
	/**
	 * Fuegt einen Eventhandler hinzu; verfuegbarer Event: 'close'
	 * @param event Der Event
	 * @param action Die Funktion die ausgefuehrt werden soll
	 **/
	_.on = function(event, action) {
		if(event == 'close') {
			events.close.actions['_' + (++events.close.nr)] = action;
			
			return new stopEvent(event, events.close.nr);
		}
	}
})(this, 'fenster');