"use strict";

/**
 * Hilfsobjekt fuer einfache Methoden
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	/**
	 * Wrapper fuer die Methoden
	 **/
	var _ = function() {
		var i, j = arguments.length, elems = [];
		
		if(j === 0) {
			return _;
		}
		
		for(i=0,j=arguments.length;i<j;++i) {
			elems[i] = arguments[i];
		}
		
		for(i in _) {
			elems[i] = (function(i) {
				return function() {
					return _[i].apply(this, arguments);
				};
			})(i);
		}
		
		return elems;
	};
	
	root[name] = _;
	
	var startFunctions = [], started = false, movingObject = null, movingFunc = function() {};
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	/**
	 * Definitionen
	**/
	
	_.id = function(id) {
		return document.getElementById(id);
	};
	
	/**
	 * Rufe eine Funktion nach dem Laden der Seite auf
	 * @param action Die Funktion, die aufgerufen werden soll
	 **/
	_.addToStart = function(action) {
		if(started) {
			action();
		} else {
			startFunctions.push(action);
		}
	};
	
	/**
	 * Startet die Funktionen, die bei dem Laden der Seite aufgerufen werden sollen
	 **/
	_.start = function() {
		started = true;
		
		var i, j;
		
		for(i=0,j=startFunctions.length;i<j;++i) {
			startFunctions[i]();
		}
		
		startFunctions = [];
	};
	
	/**
	 * !Achtung! Funktioniert nur, wenn der Wrapper benutzt wurde
	 * Fuegt einem oder mehreren Objekten einen Event hinzu
	 * @param event Der Event
	 * @param action Die Funktion, die ausgefuehrt werden soll
	 **/
	_.on = function(event, action) {
 		var i, j;
 		
 		for(i=0,j=this.length;i<j;++i) {
 			_.event(this[i], event, action);
 		}
 		
 		return this;
 	};
	
	/**
	 * Fuegt einem Objekt einen Event hinzu
	 * @param objekt Das Objekt
	 * @param event Der Event
	 * @param action Die Funktion, die ausgefuehrt werden soll
	 **/
	_.event = function(object, event, action) {
		object.addEventListener(event, action, true);
	};
	
	/**
	 * Setzt das Objekt das verschiebbar
	 * @param obj Das Objekt
	 * @param func Die Funktion, die bei dem Verschieben ausgefuehrt werden soll
	 **/
	_.movable = function(obj, func) {
		movingObject = obj;
		
		movingFunc = func;
	};
	
	/**
	 * Erstellt ein SVG Element
	 * @param Der Tag des Objektes
	 * (@param [Objekt]) Die Einstellungen des Objektes
	 **/
	_.createNS = function() {
		var tag = document.createElementNS('http://www.w3.org/2000/svg', arguments[0]);
		
		if(arguments.length > 1) {
			var name;
			
			for(name in arguments[1]) {
				if(name === 'content') {
					tag.appendChild(document.createTextNode(arguments[1][name]));
				} else {
					tag.setAttribute(name, arguments[1][name]);
				}
			}
		}
		
		return tag;
	};
	
	/**
	 * Ab hier Funktionsaufrufe
	**/
	_.addToStart(function() {
		_.event(window, 'mouseup', function(event) {
			// Falls es eine Abschlussfunktion gibt, rufe diese auf
			if(movingFunc.finished !== undefined) {
				movingFunc.finished(event);
			}
			
			// Setze die Objekte zurueck
			movingFunc = function() {};
			
			movingObject = null;
		});
		
		/**
		 * Falls ein Objekt verschoben werden soll, rufe dessen Funktion auf
		 **/
		_.event(window, 'mousemove', function(event) {
			if(document.hasFocus()) {
				if(movingObject !== null) {
					movingFunc(event);
				}
			}
		});
	});
	
	/**
	 * Rufe nach dem Laden der Seite die Funktionen auf
	 **/
	_.event(window, 'load', function() {
		_.start();
	});
})(this, '_');