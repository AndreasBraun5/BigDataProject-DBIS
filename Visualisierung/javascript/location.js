"use strict";

/**
 * Berechnung der Latitude und Longitude fuer einen Bereich
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
	
	var latLon = new Worker('javascript/geo/latlon-spherical.js');
	
	var requests = {}, // Die aktuellen requests
		requestNr = 0; // Ein Stack fuer die wartenden Requests
	
	/**
	 * Sendet eine Anfrage an die Framework
	 * @param data Das Datenobjekt
	 * @param nr Die Nummer des Aufrufs
	 * @param callback Die Callback Funktion
	 **/
	function sendRequest(data, nr, callback) {
		requests[nr] = callback;
		
		data.nr = nr;
		
		latLon.postMessage(data);
	}
	
	/**
	 * Der Eventhandler zur Kommunikation mit dem Framework
	 **/
	latLon.addEventListener('message', function(event) {
		var nr = event.data.nr;
		
		if(nr in requests) {
			requests[nr](event.data.data);
			
			delete requests[nr];
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
	 * Berechne eine Koordinate
	 * @param lat Die Latitude der aktuellen Koordinate
	 * @param lon Die Longitude der aktuellen Koordinate
	 * @param distance Der Abstand zu der aktuellen Koordinate
	 * @param degree Der Winkel
	 * @param callback Die Callback Funktion
	 **/
	_.computeLatLon = function(lat, lon, distance, degree, callback) {
		var nr = getNr(callback);
		
		sendRequest({'action': 'latLon', 'lat': lat, 'lon': lon, 'distance': distance, 'degree': degree}, nr, callback);
	};
	
	/**
	 * Berechne den Abstand zwischen zwei Koordinaten
	 * @param lat1 Die Latitude der erste Koordinate
	 * @param lon1 Die Longitude der ersten Koordinate
	 * @param lat2 Die Latitude der zweiten Koordinate
	 * @param lon2 Die Longitude der zweiten Koordinate
	 * @param callback Die Callback Funktion
	 **/
	_.computeDistance = function(lat1, lon1, lat2, lon2, callback) {
		var nr = getNr(callback);
		
		sendRequest({'action': 'distance', 'lat1': lat1, 'lon1': lon1, 'lat2': lat2, 'lon2': lon2}, nr, callback);
	};
	
	/**
	 * Berechne den Mittelpunkt zweier Koordinaten
	 * @param lat1 Die Latitude der erste Koordinate
	 * @param lon1 Die Longitude der ersten Koordinate
	 * @param lat2 Die Latitude der zweiten Koordinate
	 * @param lon2 Die Longitude der zweiten Koordinate
	 * @param callback Die Callback Funktion
	 **/
	_.computeMidpoint = function(lat1, lon1, lat2, lon2, callback) {
		var nr = getNr(callback);
		
		sendRequest({'action': 'midpoint', 'lat1': lat1, 'lon1': lon1, 'lat2': lat2, 'lon2': lon2}, nr, callback);
	};
})(this, 'geolocation');