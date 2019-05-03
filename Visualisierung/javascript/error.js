"use strict";

/**
 * Objekt, um Fehler zu loggen
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 * Nutzung:
 * error.add(['Wo trat der Fehler auf', fehler]);
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
	
	// Die bisherigen Fehler
	_.errors = [];
	
	/**
	 * Fuege einen Fehler hinzu
	 * @param e [Ort des Auftretens, Fehler]
	 **/
	_.add = function(e) {
		_.errors.push(e);
		
		$('#databaseError').modal('show');
		
		var tr = document.createElement('tr');
		
		var nr = document.createElement('th');
		
		nr.innerHTML = _.errors.length;
		nr.setAttribute('scope', '1');
		
		var name = document.createElement('td'),
			fehler = document.createElement('td');
		
		name.innerHTML = e[0];
		fehler.innerHTML = e[1];
		
		tr.appendChild(nr);
		tr.appendChild(name);
		tr.appendChild(fehler);
		
		$('#databaseErrorMessage').append(tr);
	};
})(this, 'error');

// Setze das Objekt global
global.error = error;