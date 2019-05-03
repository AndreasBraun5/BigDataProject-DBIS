"use strict";

/**
 * Behandelt die Verbindung zur MSSQL Datenbank
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

this.mssql = (function(created_from, database_settings) {
	if(created_from.mssql !== undefined) {
		created_from.mssql = undefined;
		
		delete created_from.mssql;
	}
	
	var sql = require('mssql');
	
	var connection;
	
	var connected = false, connections = {'activ': false, 'queue': []};
	
	/**
	 * Baue die Verbindung auf
	 * @param callback Die Callbackfunktion
	 **/
	var connect = function(callback) {
		connection = new sql.Connection(database_settings);
		
		connection.connect(callback);
	};
	
	/**
	 * Schliesse die Verbindung zur Datenbank
	 **/
	var closeDB = function() {
		if(connected) {
			connection.close();
		}
		
		connected = false;
	};
	
	// Schliesse die Verbindung, wenn das Fenster geschlossen wird
	fenster.on('close', closeDB);
	
	/**
	 * Fuehre einen Query aus
	 * @param action Die Callback Funktion
	 **/
	var query = function(action) {
		if(!connected) {
			connect(function(err) {
				if(err !== undefined && err !== null) {
					action(err);
					
					return;
				}
				
				connected = true;
				
				action();
			});
		} else {
			action();
		}
	};
	
	/**
	 * Fuehre einen Query aus
	 * @param sqlString Der SQL String
	 * [@param Werte fuer Prepared Statements] Ein Objekt mit den Werten fuer Prepared Statements
	 * @param callback Die Callback Funktion
	 **/
	var query_action = function(sqlString, callback) {
		var parameter = arguments;
		
		if(connections.activ === true) {
			connections.queue.push(function() {
				query_action.apply(null, parameter);
			});
			
			return;
		} else {
			connections.activ = true;
		}
		
		var function_ = parameter[parameter.length - 1];
		
		sqlString += ';'
		
		parameter = (parameter.length === 3) ? [sqlString, callback] : [sqlString];
		
		parameter.push(function(err, recordset) {
			try {
				function_(err, recordset);
			} catch(e) { error.add(['Callback failed', e]); }
			
			if(err !== undefined) {
				error.add(['Error by query', err]);
			}
			
			connections.activ = false;
			
			if(connections.queue.length === 0) {
				closeDB();
			} else {
				connections.queue[0]();
				connections.queue.splice(0, 1);
			}
		});
		
		query(function(err) {
			if(err !== undefined) {
				error.add(['Connection to database', err]);
				
				parameter[parameter.length - 1](err);
				
				return;
			}
			
			var request = new sql.Request(connection);
			
			if(parameter.length == 2) {
				request.query(parameter[0], parameter[1]);
			} else {
				var name;
				
				for(name in parameter[1]) {
					request.input(name, parameter[1][name]);
				}
				
				request.query(parameter[0], parameter[2]);
			}
		});
	};
	
	var praefix = 'bachelor_bigdata2_';
	
	var _ = function() {
		
	};
	
	/**
	 * Funktion fuer SELECT Anfragen
	 * @param spalten [Array] Die gewunschten Spalten
	 * @param tabelle Die Tabelle
	 * @param sonstiges WHERE, GROUP BY, ...
	 * @param keyWoerter Ein Objekt mit den Werten fuer Prepared Statements
	 * @param callback Die Callback Funktion
	 * [@param maxRows] Die maximale Anzahl Ergebnisse; Standardmaessig 10000
	 **/
	_.select = function(spalten, tabelle, sonstiges, keyWoerter, callback, maxRows) {
		if(tabelle.indexOf('(') === -1) tabelle = praefix + tabelle;
		
		if(maxRows === undefined) maxRows = 10000;
		else if((typeof maxRows) === 'number')
			if(maxRows >= 1 && maxRows < 10000) maxRows = Math.floor(maxRows);
		
		query_action('SELECT TOP ' + maxRows + ' ' + spalten.join(', ') + ' FROM ' + tabelle + ' ' + sonstiges, keyWoerter, callback);
	};
	
	/**
	 * Funktion fuer INSERT's
	 * @param spalten [Array] Die Spalten, die eingetragen werden sollen
	 * @param tabelle Die Tabelle
	 * @param werte [Array] Die Werte fuer die Spalten
	 * @param keyWoerter Ein Objekt mit den Werten fuer Prepared Statements
	 * @param callback Die Callback Funktion
	 **/
	_.insert = function(spalten, tabelle, werte, keyWoerter, callback) {
		if(tabelle.indexOf('(') === -1) tabelle = praefix + tabelle;
		
		query_action('INSERT INTO ' + tabelle + ' (' + spalten.join(', ') + ') VALUES (' + werte.join(', ') + ')', keyWoerter, callback);
	};
	
	/**
	 * Fuegt bei einem Namen den praefix der Tabelle hinzu
	 * @param name Der Name
	 **/
	_.getTableName = function(name) {
		return praefix + name;
	};
	
	/**
	 * Fragt alle Tabellen ab
	 * @param callback Die Callback Funktion
	 **/
	_.zeigeAlleTabellen = function(callback) {
		query_action("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';", callback);
	};
	
	/**
	 * Fragt alle Eigenschaften einer Tabelle ab und schreibt diese auf die Console
	 * @param name Der Tabellenname
	 **/
	_.tabellenEigenschaften = function(tabellenname) {
		query_action("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @name", {'name': tabellenname},
			function(err, data) { console.log("Fehler:", err, "Ergebnis:", data); });
	};
	
	return _;
}).bind(null, this, database_settings());