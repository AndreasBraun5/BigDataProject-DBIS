"use strict";

/**
 * Baut das Objekt fuer die Autocompletion auf
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

// Hole die Staedtedaten
var xhr = new XMLHttpRequest();

// Wichtig: Nicht asynchron!
xhr.open('GET', 'cityData.json', false);

xhr.responseType = 'json';

// Das Objekt, das alle Staedte enthaelt
var staedteIndex = {'staedte': []};

xhr.onreadystatechange = function() {
	if(xhr.readyState === 4) {
		staedteIndex.staedte = xhr.response;
	}
}

xhr.send();

var i, j;

for(i=0,j=staedteIndex.staedte.length;i<j;++i) {
	if('nm' in staedteIndex.staedte[i]) {
		staedteIndex.staedte[i].nm += ' [' + staedteIndex.staedte[i].countryCode + ', ' + staedteIndex.staedte[i].id + ']';
	}
}

/**
 * Baue den Index der Staedtedaten auf bis zu einer maximalen Tiefe
 * @param objekt Das Objekt, in dem die Staedte gespeichert werden
 * @param staedte die verbleibenden Staedte
 * @param tiefe die aktuelle Tiefe
 **/
function buildIndex(objekt, staedte, tiefe) {
	var i, j, firstChar;
	
	objekt.buchstaben = {};
	objekt.buchstabenSorted = [];
	
	for(i=0,j=staedte.length;i<j;++i) {
		if(staedte[i].nm.length === tiefe) {
			objekt.isCity = true;
			objekt.cityData = staedte[i];
		} else {
			firstChar = staedte[i].nm.charAt(tiefe);
			
			objekt.buchstaben[firstChar] = true;
			
			if(!(firstChar in objekt)) {
				objekt[firstChar] = {'staedte': []};
			}
			
			objekt[firstChar].staedte.push(staedte[i]);
		}
	}
	
	for(i in objekt.buchstaben) {
		objekt.buchstabenSorted.push(i);
	}
	
	objekt.buchstabenSorted.sort();
	
	if(tiefe < 4) {
		for(i in objekt.buchstaben) {
			buildIndex(objekt[i], objekt[i].staedte, tiefe + 1);
			
			delete objekt[i].staedte;
		}
	}
}

buildIndex(staedteIndex, staedteIndex.staedte, 0);

delete staedteIndex.staedte;

// Sende eine Nachricht, dass die Staedte geladen wurden
self.postMessage('staedte_geladen');

/**
 * Suche Staedte aus dem Objekt
 * @param objekt Das Objekt, in dem die Staedte liegen
 * @param search Der gesuchte Name
 * @param index Die bisher durchsuchte Tiefe
 * @param maxNumber Die maximale Anzahl an Ergebnissen
 * @param type Ob der Name exakt uebereinstimmen soll (type === 'find')
 * @return Die gefunden Staedten. Bei type !== 'find' ein Array von Strings, bei type === find ein Array mit der Stadt und ihren Daten
 **/
function getStaedteFromObjekt(objekt, search, index, maxNumber, type) {
	var result = [], i, j;
	
	if(search.length === 0) {
		return result;
	}
	
	if(search.length === index) {
		if(objekt.isCity) {
			result.push((type === 'find') ? objekt.cityData : objekt.cityData.nm);
		} else if(type === 'find') {
			return result;
		}
	}
	
	var i, j;
	
	if('staedte' in objekt) {
		var regex = new RegExp('^' + search.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&') + (type === 'find' ? '$': ''));
		
		for(i=0,j=objekt.staedte.length;i<j && result.length<maxNumber;++i) {
			if(objekt.staedte[i].nm.match(regex) !== null) {
				result.push((type === 'find') ? objekt.staedte[i] : objekt.staedte[i].nm);
			}
		}
	} else if(type !== 'find') {
		var i, j = objekt.buchstabenSorted.length;
		
		for(i=0;i<j;++i) {
			if(result.length >= maxNumber) {
				return result.sort();
			}
			
			result = result.concat(getStaedteFromObjekt(objekt[objekt.buchstabenSorted[i]], search, index, maxNumber - result.length, type));
		}
	}
	
	return result.sort();
}

/**
 * Seine eine Antwort
 * @param data Das Array mit den Ergebnissen
 * @param nr Die Nr der Anfrage
 **/
function sendAnswer(data, nr) {
	self.postMessage({'data': data, 'nr': nr});
}

/**
 * Der Eventhandler fuer die Anfragen
 **/
self.addEventListener('message', function(event) {
	var search = event.data.search, index = 0, nextChar, objekt = staedteIndex;
	
	while(index < search.length && 'buchstaben' in objekt) {
		nextChar = search.charAt(index++);
		
		if(nextChar in objekt.buchstaben) {
			if(nextChar in objekt) {
				objekt = objekt[nextChar];
			} else {
				sendAnswer(getStaedteFromObjekt(objekt, search, index, event.data.maxLength, event.data.type), event.data.nr);
				
				return;
			}
		} else {
			sendAnswer([], event.data.nr);
			
			return;
		}
	}
	
	sendAnswer(getStaedteFromObjekt(objekt, search, index, event.data.maxLength, event.data.type), event.data.nr);
}, false);