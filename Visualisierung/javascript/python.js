"use strict";

/**
 * Objekt zur Kommunikation mit dem Python Importer
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	var python = require("python-shell");
	
	var _ = function() {
		
	};
	
	root[name] = _;
	
	var processes = {};
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	_.python = python;
	
	var process, started = false, activeProcesses = {}, emptyValue, isEmpty = true, numberOfProcesses = 0,
		orte = {}, nrGetList = 0, processesListed = {};
	
	/**
	 * Schreibe jede Sekunde eine leere Zeile auf den Importer
	 **/
	function sendEmptyLine() {
		if(started) {
			process.send("\n");
		}
		
		window.setTimeout(function() { sendEmptyLine(); }, 1000);
	}
	
	/**
	 * Listet alle 5 Sekunden die laufenden Prozesse auf um zu uberpruefen, dass die Anzeige aktuell ist
	 **/
	function list() {
		if(started) {
			++nrGetList;
			
			process.send("zurueck\nlist\n" + nrGetList + "\n");
		}
		
		window.setTimeout(function() { list(); }, 5000);
	}
	
	/**
	 * Starte den Importmanager
	 **/
	function start() {
		if(started) return;
		
		process = new python('nodejs_communication.py');
		
		// Pruefe die Ausgabe des Importmanagers
		process.on('message', function (message) {
			if(message.indexOf('Neuers_Prozess:|') === 0) { // Falls ein neuer Prozess angelegt wurde
				var data = message.split('|'), i, j, pid, type, name, val, id;
				
				for(i=1,j=data.length;i<j;++i) {
					val = data[i].split(':')[1];
					
					if(i === 1) id = val.replace(/Process-/g, '');
					else if(i === 2) pid = val;
					else if(i === 3) type = (val === 'keyowm') ? 'Openweathermap' : 'Twitter';
					else if(i === 4) name = orte[parseInt(val)].name;
				}
				
				if(pid !== undefined && type !== undefined && val !== undefined)
					addToTable(id, parseInt(pid), type, name);
			} else if(message.indexOf('Process_list_pid@') === 0) { // Falls die Prozessliste angezeigt wird
				var data = message.split('|'), i, j;
				
				data[0] = data[0].split('@');
				
				if(parseInt(data[0][1]) !== nrGetList) return;
				
				for(i=1,j=data.length;i<j;++i) {
					processesListed[parseInt(data[i])] = true;
				}
				
				var toDelete = [];
				
				for(i in activeProcesses) {
					if(!(i in processesListed)) {
						toDelete.push(i);
					}
				}
				
				for(i=0,j=toDelete.length;i<j;++i) {
					_.stop(toDelete[i]);
				}
			}
		});
		
		started = true;
		
		sendEmptyLine();
		list();
		
		activeProcesses = {};
	}
	
	/**
	 * Fuegt der Tabelle mit den laufenden Prozessen einen Eintrag hinzu
	 * @param id Die ID des Prozesses
	 * @param pid Die PID des Prozesses
	 * @param typ Der Typ des Prozesses (owm, twitter)
	 * @param ort Der Ort fuer den Daten gesammelt werden
	 **/
	var addToTable = function(id, pid, typ, ort) {
		if(isEmpty) {
			emptyValue = root._.id('tabelleImporterLeer');
			
			emptyValue.parentNode.removeChild(emptyValue);
			
			isEmpty = false;
		}
		
		var tr = $('<tr/>');
		
		activeProcesses[pid] = {'id': id, 'pid': pid, 'ort': ort, 'tr': tr, 'typ': (typ === 'Twitter') ? 'twitter' : 'owm'};
		
		++numberOfProcesses;
		
		root._.id('key_' + activeProcesses[pid].typ + '_anzahl').innerHTML =
				parseInt(root._.id('key_' + activeProcesses[pid].typ + '_anzahl').innerHTML) - 1;
		
		tr.append($('<td/>').text(pid));
		tr.append($('<td/>').text(typ));
		tr.append($('<td/>').text(ort));
		tr.append($('<td><span class="glyphicon glyphicon-ok"> </span><span class="glyphicon glyphicon-off"> </span></td>'));
		
		$('#tabelleImporter tbody').append(tr);
		
		tr.find('td .glyphicon-off').click(function() {
			_.stop(pid);
		});
	};
	
	/**
	 * Startet einen Import
	 * @param city Das Objekt mit den Ortsdaten
	 * @param typ Die Art des Imports
	 **/
	_.start = function(city, typ) {
		start();
		
		process.send("zurueck\n");
		
		orte[city.locationid] = city;
		
		if(typ === 'Openweathermap') {
			if(parseInt(root._.id('key_owm_anzahl').innerHTML) <= 0) {
				root._.id('generalErrorMessage').innerHTML = 'Es existieren nicht genügend Keys für Openweathermap!';
				
				$('#generalError').modal('show');
				
				return;
			}
			
			process.send("startOWM\n" + city.locationid + "\n");
		} else if(typ === 'Twitter') {
			if(parseInt(root._.id('key_twitter_anzahl').innerHTML) <= 0) {
				root._.id('generalErrorMessage').innerHTML = 'Es existieren nicht genügend Keys für Twitter!';
				
				$('#generalError').modal('show');
				
				return;
			}
			
			var latMin = Math.min(city.lat1, city.lat2), latMax = Math.max(city.lat1, city.lat2),
				lonMin = Math.min(city.long1, city.long2), lonMax = Math.max(city.long1, city.long2);
			
			process.send("startTWITTER\n" + [city.locationid, lonMin, latMin, lonMax, latMax].join(';') + "\n");
		}
		
		process.send("zurueck\n");
	};
	
	var stopNr = 0;
	
	/**
	 * Stoppt einen Prozess
	 * @param pid Die PID des Prozesses
	 **/
	_.stop = function(pid) {
		if(!started) return;
		
		process.send("zurueck\n");
		process.send("stop\n" + activeProcesses[pid].id + "\n");
		process.send("zurueck\n");
		
		activeProcesses[pid].tr.remove();
		
		root._.id('key_' + activeProcesses[pid].typ + '_anzahl').innerHTML =
				parseInt(root._.id('key_' + activeProcesses[pid].typ + '_anzahl').innerHTML) + 1;
		
		delete activeProcesses[pid];
		
		--numberOfProcesses;
		
		if(numberOfProcesses === 0) {
			$('#tabelleImporter tbody').append(emptyValue);
			
			isEmpty = true;
		}
	};
	
	/**
	 * Stoppt alle Prozesse
	 **/
	_.stopAll = function() {
		if(!started) return;
		
		process.send("zurueck\n");
		
		var i;
		
		for(i in activeProcesses) {
			process.send("stop\n" + activeProcesses[i].id + "\n");
			
			activeProcesses[i].tr.remove();
		
			root._.id('key_' + activeProcesses[i].typ + '_anzahl').innerHTML =
					parseInt(root._.id('key_' + activeProcesses[i].typ + '_anzahl').innerHTML) + 1;
		}
		
		process.send("zurueck\n");
		
		activeProcesses = {};
		
		numberOfProcesses = 0;
		
		if(!isEmpty) {
			$('#tabelleImporter tbody').append(emptyValue);
			
			isEmpty = true;
		}
	};
	
	/**
	 * Aktuelisiert die Liste mit den Prozessen
	 **/
	_.list = function() {
		list();
	};
})(this, 'python');