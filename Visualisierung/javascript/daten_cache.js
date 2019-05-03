"use strict";

/**
 * Besorgt die Daten und speichert sie zwischen
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 * Nutzung:
 * daten_cacheObjekt = new daten_cache(ort);
 * daten_cacheObjekt.showData(...)
 * daten_cacheObjekt.getNearest(...)
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	/**
	 * Fuegt die Daten in das Diagramm ein
	 * @param timestampFrom Der Zeitpunkt, ab dem der Eintrag gilt
	 * @param timestampTo Der Zeitpunkt, bis zu dem der Eintrag gilt
	 * @param data Das Objekt mit den Daten
	 * @param typ Welche der Daten genommen werden sollen
	 * @param createBar Die Funktion aus dem Diagramm, die die Daten eintraegt
	 **/
	var insertData = function(timestampFrom, timestampTo, data, typ, createBar) {
		if(typ in data && data[typ] !== null) {
			createBar(timestampFrom, timestampTo, data[typ], false);
		}
	};
	
	
	/**
	 * Erstelle das Objekt
	 * @param ort Die ID, welcher Ort ausgewaehlt ist
	 * @param datenbankFunktion Die Funktion, die bei dem Datenbank Objekt aufgerufen werden soll bei der Besorgnung der Daten
	 **/
	var _ = function(ort, datenbankFunktion) {
		var allData = {}, // Der Cache fuer die Daten
			lastNum = {}, // Die aktuellen Nummerierungen, welche Anfrage zuletzt kam
			lastZoom, // Die letzte Zoomstufe
			lastStart, // Der linke Rand der Zeit bei der letzten Anfrage
			createBarByTyp = {}; // Die Methoden, die noch aufgerufen werden sollen
		
		/**
		 * Geht durch die Zeitleiste und besorgt die Daten, wenn sie nicht im Cache liegen
		 * @param timestampFrom Der Zeitpunkt, ab wann die Daten gesucht sind
		 * @param timestampTo Der Zeitpunkt, bis wohin die Daten gesucht sind
		 * @param createBar Der Funktion, die einen Eintrag erstellt oder die Eintraege in dem Diagramm zeichnet
		 * @param typ Der Typ der Daten, die gesucht sind
		 * @param add Die Breite eines Eintrags in dem Intervall in Sekunden
		 **/
		var doWalkthrough = function(timestampFrom, timestampTo, createBar, typ, add) {
			var latest = '_' + timestampFrom, timeTyp = '_' + add;
			
			if(!(typ in lastNum)) {
				lastNum[typ] = 0;
			}
			
			if(!(timeTyp in allData)) {
				allData[timeTyp] = {'searchedFor': {}, 'latest': '', 'maxValue': Number.MIN_VALUE};
			}
			
			var latest_num = ++lastNum[typ];
			
			allData[timeTyp].latest = latest;
			
			var timestampOriginal = timestampFrom,
				name, // Eine String Repraesentation des aktuellen Zeitwertes
				i, j,
				first = -1, // Ab hier sollen die Eintraege gesucht werden
				last = 0, // Bis hier sollen die Eintrage gesucht werden
				lastVisit = 0, // Wann zuletzt bereits nach Daten gesucht wurde oder diese schon im Cache sind
				smaller = [], // Die untere Grenze bei der Suche
				bigger = [], // Die obere Grenze bei der Suche
				hasAdded = false; // Ob gesuchte Werte im Cache waren
			
			// Gehe durch die einzelnen Werte
			for(i=0;timestampFrom<timestampTo;timestampFrom+=add,++i) {
				name = '_' + timestampFrom;
				
				// Falls noch nicht nach den Daten gesucht wird
				if(!(name in allData[timeTyp].searchedFor)) {
					last = i + 1;
					
					allData[timeTyp].searchedFor[name] = [
							[typ, latest_num, (function(name, i) {
								return function() {
									insertData(timestampOriginal + add * i, timestampOriginal + add * (i + 1), allData[timeTyp][name], typ, createBar);
									
									createBarByTyp[typ] = createBar;
								};
							})(name, i)]];
				} else {
					// Suche falls noetig auch nach diesen Nummern
					if(last > lastVisit) {
						smaller.push(first);
						bigger.push(last);
					}
					
					first = i;
					
					lastVisit = i;
					
					// Falls die Daten im Cache existieren
					if(name in allData[timeTyp]) {
						insertData(timestampOriginal + add * i, timestampOriginal + add * (i + 1), allData[timeTyp][name], typ, createBar);
						
						hasAdded = true;
					} else {
						// Wenn die Daten gefunden geholt wurden, rufe diese Funktion auf
						allData[timeTyp].searchedFor[name].push(
								[typ, latest_num, (function(name, i) {
									return function() {
										insertData(timestampOriginal + add * i, timestampOriginal + add * (i + 1), allData[timeTyp][name], typ, createBar);
										
										createBarByTyp[typ] = createBar;
									};
								})(name, i)]);
					}
				}
			}
			
			// Falls Eintraege im Cache waren zeichne diese bereits in das Diagramm
			if(hasAdded) {
				createBar(0, 0, 0, true, allData[timeTyp].maxValue);
			}
			
			// Fuege falls noetig die Nummer hinzu, nach der gesucht werden soll
			if(last === i) {
				smaller.push(first);
				bigger.push(last);
			}
			
			// Erstelle die Nummern, nach denen gesucht werden soll
			var loadNums = [];
			
			for(i=0,j=smaller.length;i<j;++i) {
				loadNums[i] = ' BETWEEN ' + smaller[i] + ' AND ' + bigger[i] + ' ';
			}
			
			timestampFrom = timestampOriginal;
			
			// Falls Werte geladen werden muessen
			if(loadNums.length > 0) {
				daten[datenbankFunktion](timestampFrom, timestampTo, add, ort, function(err, data) {
					if(err === undefined) {
						var i, j = data.length, name, k, l, max;
						
						for(i=0;i<j;++i) {
							name = '_' + (timestampFrom + data[i].nr * add);
							
							for(k in data[i]) {
								if(k === 'nr') continue;
								
								allData[timeTyp].maxValue = Math.max(allData[timeTyp].maxValue, data[i][k]);
							}
							
							// Schreibe die Daten in den Cache
							allData[timeTyp][name] = data[i];
							
							// Wichtig, da Datenbanken BETWEEN unterschiedlich interpretieren!
							if(!(name in allData[timeTyp].searchedFor)) { // Falls mehr Daten geladen wurden, als gesucht waren
								allData[timeTyp].searchedFor[name] = 0;
							}
							
							// Gehe alle Eintrage durch, die nach diesem Wert gesucht haben und falls
							// die Suche noch aktuell ist, rufe die Funktion auf
							for(k=0,l=allData[timeTyp].searchedFor[name].length;k<l;++k) {
								if(allData[timeTyp].searchedFor[name][k][1] === lastNum[allData[timeTyp].searchedFor[name][k][0]]) {
									allData[timeTyp].searchedFor[name][k][2]();
								}
							}
							
							allData[timeTyp].searchedFor[name] = 0;
						}
						
						// Zeichne die neuen Eintraege
						for(i in createBarByTyp) {
							createBarByTyp[i](0, 0, 0, true, allData[timeTyp].maxValue);
						}
						
						createBarByTyp = {};
					}
				}, loadNums);
			}
		};
		
		/**
		 * Suche Werte und zeige diese an
		 * @param timestampFrom Der Zeitpunkt, ab wann die Daten gesucht sind
		 * @param timestampTo Der Zeitpunkt, bis wohin die Daten gesucht sind
		 * @param createBar Der Funktion, die einen Eintrag erstellt oder die Eintraege in dem Diagramm zeichnet
		 * @param typ Der Typ der Daten, die gesucht sind
		 * @param sec Die Breite eines Eintrags in dem Intervall in Sekunden
		 **/
		this.showData = function(timestampFrom, timestampTo, createBar, typ, sec) {
			lastZoom = sec, lastStart = timestampFrom;
			
			doWalkthrough(timestampFrom, timestampTo, createBar, typ, sec);
		};
		
		/**
		 * Sucht die zeitlich naehesten Daten
		 * @param timestamp Der Zeitpunkt
		 * @param callback Welche Funktion dann aufgerufen werden soll
		 **/
		this.getNearest = function(timestamp, callback) {
			timestamp = Math.floor((timestamp - lastStart) / lastZoom) * lastZoom + lastStart;
			
			var name = '_' + timestamp, group = '_' + lastZoom;
			
			if(group in allData) {
				if(name in allData[group]) {
					callback(allData[group][name]);
					
					return;
				}
			}
			
			callback({});
		};
	};
	
	root[name] = _;
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
})(this, 'daten_cache');