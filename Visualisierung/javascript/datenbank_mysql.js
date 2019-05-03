"use strict";

/**
 * Behandelt die Verbindung zur einer MySQL Datenbank; Achtung: datenbank_mssql.js nicht durch diese Datei ersetzbar
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

this.mysql = (function(created_from, database_settings) {
	// Loesche Referenz nach erstem Aufruf, damit nur nach ein Objekt vorhanden, das zurueckgeben wird
	if(created_from.mysql !== undefined) {
		created_from.mysql = undefined;
		
		delete created_from.mysql;
	}
	
	var sql = require('mysql');
	
	database_settings.host = database_settings.server;
	
	delete database_settings.server;
	
	var connection = sql.createConnection(database_settings);
	
	var connected = false, connections = {'activ': false, 'queue': []};
	
	// Verbinde zur Datenbank
	var connect = function(callback) {
		connection.connect(callback);
	};
	
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
		
		parameter = (parameter.length === 3) ? [sqlString, callback] : [sqlString];
		
		parameter.push(function(err, recordset) {
			function_(err, recordset);
			
			connections.activ = false;
			
			if(connections.queue.length > 0) {
				connections.queue[0]();
				connections.queue.splice(0, 1);
			}
		});
		
		query(function(err) {
			if(err !== undefined) {
				parameter[parameter.length - 1](err);
				
				return;
			}
			
			if(parameter.length == 2) {
				connection.query(parameter[0], parameter[1]);
			} else {
				var name;
				
				for(name in parameter[1]) {
					request.input(name, parameter[1][name]);
				}
				
				connection.query(parameter[0], parameter[2]);
			}
		});
	};
	
	var _ = function() {
		
	};
	
	/**
	 * Hier wurden die benoetigten Schnittestellen nach aussen hinzu kommen
	 **/
	
	return _;
}).bind(null, this, database_settings());