"use strict";

/**
 * Autocompletion fuer einen neuen Ort
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	var _ = function() {
		
	};
	
	root[name] = _;
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	// Lade die Staedtedaten in einem seperaten Thread
	var autocompletion = new Worker('javascript/autocompletion.js');
	
	var ready = false, // Ob die Staedtedaten geladen sind
		requests = {}, // Die aktuellen requests
		requestNr = 0, // Eine Nummer fuer die Nummerierungen der Requests
		stack = []; // Ein Stack fuer die wartenden Requests
	
	/**
	 * Sendet eine Anfrage an die Staedteverwaltung
	 * @param search Der gesuchte Name
	 * @param nr Die Nr der Anfrage
	 **/
	function sendRequest(search, nr) {
		autocompletion.postMessage({'type': 'autocompletion', 'maxLength': 10, 'search': search, 'nr': nr});
	}
	
	/**
	 * Der Eventhandler zur Kommunikation mit der Staedteverwaltung
	 **/
	autocompletion.addEventListener('message', function(event) {
		if(ready) {
			if((typeof event.data) === 'object') {
				var nr = event.data.nr;
				
				// Bearbeite den Request
				if(nr in requests) {
					requests[nr](event.data.data);
					
					delete requests[nr];
				}
			}
		} else {
			// Falls die Staedte geladen wurden, arbeite den Stack ab
			if(event.data === 'staedte_geladen') {
				ready = true;
				
				var i, j;
				
				for(i=0,j=stack.length;i<j;++i) {
					sendRequest(stack[i][0], stack[i][1]);
				}
			}
		}
	}, false);
	
	/**
	 * Hole die Nummer fuer einen Request
	 * @param responseFunction Die Callback Funktion
	 * return Die Nummer des Requests
	 **/
	function getNr(responseFunction) {
		var nr = ++requestNr;
		
		requestNr = requestNr % 1000000;
		
		requests[nr] = responseFunction;
		
		return nr;
	}
	
	/**
	 * Stelle einen Request
	 * @param search Der gesuchte Name
	 * @param responseFunction Die Callback Funktion
	 **/
	_.request = function(search, responseFunction) {
		var nr = getNr(responseFunction);
		
		if(ready) {
			sendRequest(search, nr);
		} else {
			stack.push([search, nr]);
		}
	};
	
	/**
	 * Finde einen exakten Namen
	 * @param search Der gesuchte Name
	 * @param responseFunction Die Callback Funktion
	 **/
	_.find = function(search, responseFunction) {
		var nr = getNr(responseFunction);
		
		autocompletion.postMessage({'type': 'find', 'maxLength': 10, 'search': search, 'nr': nr});
	};
})(this, 'autocompletion');