"use strict";

/**
 * Ein Wrapper fuer die Daten
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
	
	/*
	** Klassen
	*/
	
	
	
	/*
	** Definitionen
	*/
	
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
		datenbank.getMultipleWetterdatenAVG(date_von, date_bis, time_split, standort, function(err, data) {
			if(err !== undefined) {
				callback.call(this, err, {});
			} else {
				callback.call(this, err, data);
			}
		}, nr);
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
		datenbank.getMultipleTwitterdatenAVG(date_von, date_bis, time_split, standort, function(err, data) {
			if(err !== undefined) {
				callback.call(this, err, {});
			} else {
				callback.call(this, err, data);
			}
		}, nr);
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
		datenbank.getMultipleBadegaeste(date_von, date_bis, time_split, standort, function(err, data) {
			if(err !== undefined) {
				callback.call(this, err, {});
			} else {
				var i, j, k, toAdd = [data.length, 0], lastNr = -1, nr, anzahl = Math.ceil(46800 / time_split), ref;
				
				for(i=0,j=data.length;i<j;++i) {
					ref = data[i];
					
					nr = ref.nr - 1;
					
					for(k=1;k<=anzahl && nr > lastNr;++k,--nr) {
							toAdd.push({'nr': nr, 'badegaeste': ref.badegaeste});
					}
					
					lastNr = ref.nr;
				}
				
				data.splice.apply(data, toAdd);
				
				callback.call(this, err, data);
			}
		}, nr);
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
		datenbank.getMultipleAuswertungAVG(date_von, date_bis, time_split, standort, callback, nr);
	};
	
	/**
	 * Frage die minimalen Wetterdaten ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMinWetterdaten = function(standort, callback) {
		datenbank.getMinWetterdaten(standort, function(err, data) {
			if(err !== undefined) {
				callback.call(this, err, {});
			} else {
				var ret = ((data.length === 1) ? data[0] : {});
				
				callback.call(this, err, ret);
			}
		});
	};
	
	/**
	 * Frage die minimalen/maximalen Wetterdaten ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxWetterdaten = function(standort, callback) {
		datenbank.getMaxWetterdaten(standort, function(err, data) {
			if(err !== undefined) {
				callback.call(this, err, {});
			} else {
				var ret = ((data.length === 1) ? data[0] : {});
				
				callback.call(this, err, ret);
			}
		});
	};
	
	/**
	 * Fraegt die 5 meist verwendeten Twitterprogramme ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxTwitterSoftware = function(ort, callback) {
		datenbank.getMaxTwitterSoftware(ort, callback);
	};
	
	/**
	 * Fraegt die maximalen Badegaeste ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxBadegaeste = function(ort, callback) {
		datenbank.getMaxBadegaeste(ort, callback);
	};
	
	/**
	 * Fraegt die maximalen Auswertungswerte ab
	 * @param standort Der Standort
	 * @param callback Die Callback Funktion
	 **/
	_.getMaxAuswertung = function(ort, callback) {
		datenbank.getMaxAuswertung(ort, callback);
	};
	
	/**
	 * Frage die Anzahl der Schluessel ab
	 * @param callback Die Callback Funktion
	 **/
	_.getNumberOfKeys = function(callback) {
		datenbank.getNumberOfKeys(callback);
	};
	
	/**
	 * Fuegt einen Openweathermap Schluessel ein
	 * @param weatherkey Der Schluessel fuer Openweathermap
	 **/
	_.insertOWMKey = function(weatherkey) {
		datenbank.insertKey('owm', weatherkey, '', '', '', '');
	};
	
	/**
	 * Fuegt einen Twitterschluessel ein
	 * @param consumerkey Der Consumerkey
	 * @param consumerkeysecret Der Secret Consumerkey
	 * @param accesstoken Das Accesstoken
	 * @param accesstokensecret Das Secret Accesstoken
	 **/
	_.insertTwitterKey = function(consumerkey, consumerkeysecret, accesstoken, accesstokensecret) {
		datenbank.insertKey('twitter', '', consumerkey, consumerkeysecret, accesstoken, accesstokensecret);
	};
	
	/**
	 * Frage die verfuegbaren Orte ab
	 * @param callback Die Callback Funktion
	 **/
	_.getOrte = function(callback) {
		datenbank.getOrte(function(err, data) {
			if(err !== undefined) {
				callback.call(this, err, []);
			} else {
				callback.call(this, err, data);
			}
		});
	};
})(this, 'daten');