"use strict";

/**
 * Speichert die Verbindungsdaten zur Datenbank
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

(function(created_from, can_be_accessed) {
	var data = {server: '81.169.244.134', user: 'TeamUser', password: 'Bigdata2016', database: 'TestDatabase2'};
	
	var copy = function() {
		if(accessed > can_be_accessed) {
			return;
		}
		
		var i, new_data = {};
		
		for(i in data) {
			new_data[i] = data[i];
		}
		
		return new_data;
	};
	
	var accessed = 0;
	
	created_from.database_settings = function() {
		if(accessed < can_be_accessed) {
			++accessed;
			
			if(accessed >= can_be_accessed) {
				created_from.database_settings = undefined;
				
				delete created_from.database_settings;
			}
			
			return copy();
		}
	};
	
	created_from.database_settings.toString = 'function database_settings() { [native code] }';
})(this, 2); // 2. Parameter gibt an, wie oft die Verbindungsdaten abgefragt werden koennen, danach loescht sich die Funktion