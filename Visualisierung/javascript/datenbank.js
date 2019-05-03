"use strict";

/**
 * Ein Wrapper fuer die Datenbank
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	var mssql = root.mssql, mysql = root.mysql;
	
	root.mssql = undefined;
	root.mysql = undefined;
	
	delete root.mssql;
	delete root.mysql;
	
	mssql = mssql();
	
	var _ = function() {
		
	};
	
	root[name] = _;
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	/**
	 * Gibt die richtige Zeitdarstellung fuer die Datenbank zurueck; falls kein Argument uebergeben, wird die aktuelle Zeit zurueckgegeben
	 * [@param date] Ein Objekt (Date, Number)
	 **/
	var getZeit = function(date) {
		if(date instanceof Date) {
			return date.getTime() / 1000;
		} else if((typeof date) === 'number') {
			return Math.ceil(date);
		} else {
			return new Date().getTime() / 1000;
		}
	};
	
	// Speichert die zumeist verwendeten Twitterprogrammen an verschiedenen Orten
	var maxTwitterSoftware = {};
	
	/**
	 * Fraegt die 5 meist verwendeten Twitterprogramme ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxTwitterSoftware = function(standort, callback) {
		mssql.select(['deviceinfo', 'COUNT(deviceinfo) AS anzahl'], 'tweet',
					'WHERE locationarea_locationid = @standort GROUP BY deviceinfo ORDER BY anzahl DESC',
					{'standort': standort}, function(err, data) {
						if(err === undefined) {
							var i, j;
							
							maxTwitterSoftware[standort] = {'namen': [], 'nr': {}};
							
							for(i=0,j=data.length;i<j;++i) {
								maxTwitterSoftware[standort].namen.push(data[i].deviceinfo);
							}
							
							callback(err, data);
						}
					}, 5);
	};
	
	/**
	 * Fraegt die Wetterdaten in einem Zeitraum ab
	 * @param date_von Der Zeitpunkt, ab dem die Daten abgefragt werden sollen
	 * @param date_bis Der Zeitpunkt, bis zu dem die Daten abgefragt werden sollen
	 * @param time_split Die Groesse, die ein Zeitabschnitt haben soll
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 * @param nr Die gesuchten Zeitabschnitte
	 **/
	_.getMultipleWetterdatenAVG = function(date_von, date_bis, time_split, standort, callback, nr) {
		date_von = getZeit(date_von);
		date_bis = getZeit(date_bis);
		
		var felder = ['temperatur', 'luftfeuchte', 'wolken', 'windrichtung', 'windgeschwindigkeit', 'luftdruck'], i, j,
			felderCopy = felder.slice(0),
			addWhere = '';
		
		for(i=0,j=felder.length;i<j;++i) {
			felder[i] = 'AVG(' + felder[i] + ') AS ' + felder[i];
		}
		
		if(nr !== undefined) {
			if(nr instanceof Array && nr.length > 0) {
				addWhere = ' WHERE nr ' + nr.join(' AND nr ');
			}
		}
		
		felder.push('nr');
		felderCopy.splice(felderCopy.length, 0, 'wetterzeit', 'locationarea_locationid');
		
		mssql.select(felder, '(SELECT ' + felderCopy.join(', ') + ',\
								FLOOR((wetterzeit - @von) / @time_split) AS nr FROM ' + mssql.getTableName('wetter') + '\
								 WHERE wetterzeit <= @bis AND wetterzeit >= @von AND\
								 locationarea_locationid = @standort) weatherData',
										addWhere + ' GROUP BY nr ORDER BY nr',
				{'standort': standort, 'von': date_von, 'bis': date_bis, 'time_split': time_split}, callback);
	};
	
	/**
	 * Fraegt die Twitterdaten in einem Zeitraum ab
	 * @param date_von Der Zeitpunkt, ab dem die Daten abgefragt werden sollen
	 * @param date_bis Der Zeitpunkt, bis zu dem die Daten abgefragt werden sollen
	 * @param time_split Die Groesse, die ein Zeitabschnitt haben soll
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 * @param nr Die gesuchten Zeitabschnitte
	 **/
	_.getMultipleTwitterdatenAVG = function(date_von, date_bis, time_split, standort, callback, nr) {
		date_von = getZeit(date_von);
		date_bis = getZeit(date_bis);
		
		var felder = [], i, j, felderCopy, addWhere = '';
		
		var inserts = {'standort': standort, 'von': date_von, 'bis': date_bis, 'time_split': time_split};
		
		for(i=0,j=maxTwitterSoftware[standort].namen.length;i<j;++i) {
			inserts['device_' + i] = maxTwitterSoftware[standort].namen[i];
			
			felder.push('deviceinfo = @device_' + i);
		}
		
		mssql.select(['deviceinfo', 'COUNT(deviceinfo) AS anzahl', 'nr'], '(SELECT deviceinfo, FLOOR((tweetzeit - @von) / @time_split)\
								 AS nr FROM ' + mssql.getTableName('tweet') + '\
								 WHERE tweetzeit <= @bis AND tweetzeit >= @von AND\
								 locationarea_locationid = @standort AND (' + felder.join(' OR ') + ')) tweetData',
										addWhere + ' GROUP BY nr, deviceinfo ORDER BY nr, anzahl DESC',
				inserts, function(err, data) {
					if(err === undefined) {
						var i, j, nr, obj = [], allNr = {};
						
						for(i=0,j=data.length;i<j;++i) {
							nr = data[i].nr;
							
							if(!(nr in allNr)) {
								allNr[nr] = true;
								
								obj.push({'nr': nr});
							}
							
							obj[obj.length - 1]['twitter_' + data[i].deviceinfo] = data[i].anzahl;
						}
						
						data = obj;
					}
					
					callback(err, data);
				});
	};
	
	/**
	 * Frage die minimalen/maximalen Wetterdaten ab
	 * @param type Der Art die gesucht ist ('MIN' oder 'MAX')
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	function getMinMaxWetterdaten(type, standort, callback) {
		var felder = ['temperatur', 'luftfeuchte', 'wolken', 'windrichtung', 'windgeschwindigkeit', 'luftdruck'], i, j;
		
		if(type !== 'MIN') {
			type = 'MAX';
		}
		
		for(i=0,j=felder.length;i<j;++i) {
			felder[i] = type + '(' + felder[i] + ') AS ' + felder[i];
		}
		
		mssql.select(felder, 'wetter', 'WHERE locationarea_locationid = @standort', {'standort': standort}, callback);
	}
	
	/**
	 * Frage die minimalen Wetterdaten ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMinWetterdaten = function(standort, callback) {
		getMinMaxWetterdaten('MIN', standort, callback);
	};
	
	/**
	 * Frage die minimalen/maximalen Wetterdaten ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxWetterdaten = function(standort, callback) {
		getMinMaxWetterdaten('MAX', standort, callback);
	};
	
	/**
	 * Frage die verfuegbaren Orte ab
	 * @param callback Die Callback Funktion
	 **/
	_.getOrte = function(callback) {
		mssql.select(['locationid', 'name', 'long1', 'lat1', 'long2', 'lat2'], 'locationarea', '', {}, callback);
	};
	
	/**
	 * Frage die Anzahl der Schluessel ab
	 * @param callback Die Callback Funktion
	 **/
	_.getNumberOfKeys = function(callback) {
		mssql.select(['keytype', 'COUNT(*) AS anzahl'], 'keymanager', 'GROUP BY keytype', {}, callback);
	};
	
	/**
	 * Fuegt einen Orte ein
	 * @param cityId Die Openweathermap ID des Ortes
	 * @param name Der Name des Ortes
	 * @param long1 Die Longitude 1 der Bounding Box
	 * @param long1 Die Latitude 1 der Bounding Box
	 * @param long1 Die Longitude 2 der Bounding Box
	 * @param long1 Die Latitude 2 der Bounding Box
	 **/
	_.insertOrt = function(cityId, name, long1, lat1, long2, lat2) {
		var i; for(i=2;i<6;++i) if((typeof arguments[i]) !== 'number' || Number.isNaN(arguments[i])) return;
		
		mssql.insert(['locationid', 'name', 'lat1', 'long1', 'lat2', 'long2'], 'locationarea',
					['@loc', '@name', lat1, long1, lat2, long2],
					{'loc': cityId, 'name': name}, function() {});
	};
	
	/**
	 * Fuegt einen Schluessel; entweder weatherkey oder die vier Key's fuer Twitter
	 * @param keytype Welche Art von Schluessel eingefuegt werden soll ('owm', 'twitter')
	 * @param weatherkey Der Schluessel fuer Openweathermap
	 * @param consumerkey Der Consumerkey fuer Twitter
	 * @param consumerkeysecret Der Secret Consumerkey fuer Twitter
	 * @param accesstoken Das Accesstoken fuer Twitter
	 * @param accesstokensecret Das Secret Accesstoken fuer Twitter
	 **/
	_.insertKey = function(keytype, weatherkey, consumerkey, consumerkeysecret, accesstoken, accesstokensecret) {
		if(keytype === 'owm') {
			if(weatherkey === '') {
				error.add(['Schlüssel ungültig', 'Der Schlüssel für Openweathermap ist ungültig!']);
				
				return;
			}
		} else if(keytype === 'twitter') {
			if(consumerkey === '' || consumerkeysecret === '' || accesstoken === '' || accesstokensecret === '') {
				error.add(['Schlüssel ungültig', 'Die Schlüssel für Twitter sind ungültig!']);
				
				return;
			}
		} else {
			error.add(['Schlüssel speichern', 'Der Schlüsseltyp ist ungültig!']);
			
			return;
		}
		
		/**
		 * Generiert einen Namen fuer den Schluessel
		 * @return Der Name fuer den Schluessel
		 **/
		var neuerKey = function() {
			return 'key_' + Math.floor(Math.random() * 100000000);
		};
		
		// Versucht den Schluessel zu speichern
		var speichern = function(keyname) {
			mssql.insert(['keyname', 'keytype', 'weatherkey', 'consumerkey', 'consumerkeysecret', 'acesstoken', 'acesstokensecret'],
						'keymanager',
						['@keyname', '@keytype', '@weatherkey', '@consumerkey', '@consumerkeysecret', '@accesstoken', '@accesstokensecret'],
						{'keyname': keyname, 'keytype': keytype, 'weatherkey': weatherkey, 'consumerkey': consumerkey,
							'consumerkeysecret': consumerkeysecret, 'accesstoken': accesstoken, 'accesstokensecret': accesstokensecret},
						function(err, data) {
							if(err === undefined) {
								root._.id('myModalLabel2').innerHTML = 'Schlüssel gespeichert';
								root._.id('generalOkMessage').innerHTML = 'Der Schlüssel wurde in der Datenbank gespeichert!';
								
								$('#generalOk').modal('show');
							}
						});
		};
		
		// Versucht den Schluessel zu speichern, falls 100-mal derselbe Name exisiterte, wird abgebrochen
		var testen = function(keyname, anzahl) {
			mssql.select(['keyname'], 'keymanager', 'WHERE keyname = @keyname', {'keyname': keyname}, function(err, data) {
				if(err === undefined && data.length === 0) {
					speichern(keyname);
				} else {
					if(anzahl > 100) {
						error.add(['Schlüssel speichern', 'Der Schlüssel konnte nicht gespeichert werden!']);
						
						return;
					}
					
					testen(neuerKey(), ++anzahl);
				}
			});
		};
		
		testen(neuerKey(), 0);
	};
	
	/**
	 * Fraegt alle Tabelle ab
	 * @param callback Die Callback Funktion
	 **/
	_.zeigeAlleTabellen = function(callback) {
		mssql.zeigeAlleTabellen(callback);
	};
	
	/**
	 * Zeigt die Eigenschaften einer Tabelle
	 * @param tabelle Der Name der Tabelle
	 **/
	_.tabellenEigenschaften = function(tabelle) {
		mssql.tabellenEigenschaften(tabelle);
	};
	
	/**
	 * Fraegt die maximalen Badegaeste ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxBadegaeste = function(standort, callback) {
		mssql.select(['MAX(anzahlbadegaeste) AS badegaeste', 'badname'], 'baederverwaltung', 'WHERE locationarea_locationid = @standort\
						GROUP BY badname ORDER BY badname',
				{'standort': standort}, callback);
	};
	
	/**
	 * Fraegt die Badegaeste in einem Zeitraum ab
	 * @param date_von Der Zeitpunkt, ab dem die Daten abgefragt werden sollen
	 * @param date_bis Der Zeitpunkt, bis zu dem die Daten abgefragt werden sollen
	 * @param time_split Die Groesse, die ein Zeitabschnitt haben soll
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 * @param nr Die gesuchten Zeitabschnitte
	 **/
	_.getMultipleBadegaeste = function(date_von, date_bis, time_split, standort, callback, nr) {
		date_von = getZeit(date_von);
		date_bis = getZeit(date_bis);
		
		var addWhere = '';
		
		if(nr !== undefined) {
			if(nr instanceof Array && nr.length > 0) {
				addWhere = ' WHERE nr ' + nr.join(' AND nr ');
			}
		}
		
		mssql.select(['AVG(anzahlbadegaeste) AS badegaeste', 'nr'], '(SELECT anzahlbadegaeste,\
								FLOOR(((zeit - 7200) - @von) / @time_split) AS nr FROM ' + mssql.getTableName('baederverwaltung') + '\
								WHERE (zeit - 7200) <= @bis AND (zeit - 7200) >= @von AND\
								locationarea_locationid = @standort) guestsData',
										addWhere + ' GROUP BY nr ORDER BY nr',
				{'standort': standort, 'von': date_von, 'bis': date_bis, 'time_split': time_split}, callback);
	};
	
	/**
	 * Fraegt die maximalen Auswertungswerte ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxAuswertung = function(standort, callback) {
		mssql.select(['MAX(wert) AS wert', 'name'], 'auswertung', 'WHERE locationarea_locationid = @standort\
						GROUP BY name ORDER BY name',
				{'standort': standort}, callback);
	};
	
	/**
	 * Fraegt die Auswertungsdaten in einem Zeitraum ab
	 * @param date_von Der Zeitpunkt, ab dem die Daten abgefragt werden sollen
	 * @param date_bis Der Zeitpunkt, bis zu dem die Daten abgefragt werden sollen
	 * @param time_split Die Groesse, die ein Zeitabschnitt haben soll
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 * @param nr Die gesuchten Zeitabschnitte
	 **/
	_.getMultipleAuswertungAVG = function(date_von, date_bis, time_split, standort, callback, nr) {
		date_von = getZeit(date_von);
		date_bis = getZeit(date_bis);
		
		var addWhere = '';
		
		if(nr !== undefined) {
			if(nr instanceof Array && nr.length > 0) {
				addWhere = ' WHERE nr ' + nr.join(' AND nr ');
			}
		}
		
		mssql.select(['name', 'AVG(wert) AS wert', 'nr'], '(SELECT wert, name,\
								FLOOR((zeit - @von) / @time_split) AS nr FROM ' + mssql.getTableName('auswertung') + '\
								 WHERE zeit <= @bis AND zeit >= @von AND\
								 locationarea_locationid = @standort) auswertungData',
										addWhere + ' GROUP BY nr, name ORDER BY nr',
				{'standort': standort, 'von': date_von, 'bis': date_bis, 'time_split': time_split},
				function(err, data) {
					if(err === undefined) {
						var i, j, nr, obj = [], allNr = {};
						
						for(i=0,j=data.length;i<j;++i) {
							nr = data[i].nr;
							
							if(!(nr in allNr)) {
								allNr[nr] = true;
								
								obj.push({'nr': nr});
							}
							
							obj[obj.length - 1]['auswertung_' + data[i].name] = data[i].wert;
						}
						
						data = obj;
					}
					
					callback(err, data);
				}, 100000);
	};
})(this, 'datenbank');