"use strict";

/**
 * Die GUI Logik
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

var visualisierung_activ = false, // ob die Visualisierung gerade aktiv ist
	orte = {}, // die existierenden Orte indiziert ueber Name
	orteIndex = {}, // die existierenden Orte indiziert ueber die ID
	karteNeuerOrt, // die Karte, die die Position des neuen Ortes zeigt
	karteNeuerOrtMarkers = [], // die Orte die auf der Karte fuer die neuen Orte angezeigt werden
	lastCity = null, // die zuletzt gewaehlte Stadt bei der Suche nach einem Orte
	karteOrtAuswaehlen; // die Karte, die alle Orte zeigt fuer die Visualisierung

/**
 * Versteckt alle Seiten bis auf eine
 * @param notToHide Die Id der Seite, nicht versteckt werden soll
 **/
function hidePages(notToHide) {
	var seite = document.getElementById('Seiten'), i, j;
	
	for(i=0,j=seite.children.length;i<j;++i) {
		if(seite.children[i].getAttribute('id') !== notToHide) {
			$(seite.children[i]).addClass('hidePage');
		} else {
			$(seite.children[i]).removeClass('hidePage');
		}
	}
}

/**
 * Fuegt einen Orte in den Dropdown Listen und den Variablen "orte" und "orteIndex" hinzu
 * @param obj Das Objekt mit dem Orte
 **/
function addOrt(obj) {
	orte[obj.name] = obj;
	orteIndex[obj.locationid] = obj;
	
	var ul = $('#OrtWahl ul'), ulImporter = $('#OrtWahlImporter ul');
	
	ul.append($('<li/>').append(
			$('<a/>').attr('id', 'OrtWahl_' + obj.locationid).attr('href', '#').text(obj.name)
				.click(function() { ladeVisualisierung(this.getAttribute('id').split('_')[1], this.innerText); })
								));
	ulImporter.append($('<li/>').append(
			$('<a/>').attr('id', 'OrtWahlImporter_' + obj.locationid).attr('href', '#').text(obj.name)
				.click(function() {
					_.id('dropdownImportOrt').innerHTML = this.innerText + ' <span class="caret"> </span>';
					_.id('dropdownImportOrt').importerCityId = this.getAttribute('id').split('_')[1];
				})
								));
}

/**
 * Zeigt die Visualisierung fuer einen Orte
 * @param id Die ID des Ortes
 * @param text Der Name des Ortes
 **/
var ladeVisualisierung = function(id, text) {
	$("#karte").css({'position': 'absolute', 'bottom': '-5000px', 'left': '-5000px'});
	
	$('#OrtWahl').parent().hide();
	
	$("#textVisualisierungAnzeigen").hide();
	$("#ausgewaehlterOrt").show().find("h4").text(text);
	$("#visuBild").show();
	
	if(visualisierung_activ) {
		$("#visuBild").empty();
	}
	
	visualisierung_activ = true;
	
	$('.VisualisierungDaten').show();
	
	startVisualisierung(id, 'visuBild', 'checkBoxDaten');
}

/**
 * Laedt die Anzahl der verfuegbaren Schluessel
 **/
daten.getNumberOfKeys(function(err, data) {
	if(err === undefined) {
		_.addToStart(function() {
			var i, j;
			
			for(i=0,j=data.length;i<j;++i) {
				_.id('key_' + data[i].keytype + '_anzahl').innerHTML = data[i].anzahl;
			}
		});
	}
});

/**
 * Laedt die Orte aus der Datenbank
 **/
daten.getOrte(function(err, data) {
	if(err === undefined) {
		$(document).ready(function(){
			var i, j, namen = [];
			
			for(i=0,j=data.length;i<j;++i) {
				orte[data[i].name] = data[i];
				orteIndex[data[i].locationid] = data[i];
				
				namen.push(data[i].name);
				
				(function(data) {
					geolocation.computeMidpoint(data.lat1, data.long1, data.lat2, data.long2, function(latLon) {
						// Da in Bayreuth zu wenig Tweets, ist die Position in der Datenbank verschoben
						if(data.name === 'Bayreuth') {
							latLon.lat = 49.948059;
							latLon.lon = 11.57833;
						}
						
						karteOrtAuswaehlen.addMarker(data.locationid, {'latLng': [latLon.lat, latLon.lon], 'name': data.name,
								'locationIdDB': data.locationid});
					});
				})(data[i]);
			}
			
			namen.sort();
			
			var ul = $('#OrtWahl ul'),
				ulImporter = $('#OrtWahlImporter ul');
			
			for(i=0;i<j;++i) {
				ul.append($('<li/>').append($('<a/>').attr('id', 'OrtWahl_' + orte[namen[i]].locationid).attr('href', '#').text(namen[i])));
				ulImporter.append($('<li/>').append($('<a/>').attr('id', 'OrtWahlImporter_' + orte[namen[i]].locationid).attr('href', '#').text(namen[i])));
			}
			
			// Ort auswaehlen
			$("#OrtWahl li a").click(function() {
				ladeVisualisierung(this.getAttribute('id').split('_')[1], this.innerText);
			});
			// Ort auswaehlen
			$("#OrtWahlImporter li a").click(function() {
				_.id('dropdownImportOrt').innerHTML = this.innerText + ' <span class="caret"> </span>';
				_.id('dropdownImportOrt').importerCityId = this.getAttribute('id').split('_')[1];
			});
			// Typ auswaehlen
			$("#TypWahlImporter li a").click(function() {
				_.id('dropdownImportTyp').innerHTML = this.innerText + ' <span class="caret"> </span>';
				_.id('dropdownImportTyp').importerTypName = this.innerText.replace(/\s+/g, '');
			});
			// Typ auswaehlen
			$("#apiTypDropdown li a").click(function() {
				_.id('dropdownAPIkey').innerHTML = this.innerText + ' <span class="caret"> </span>';
			});
			
			//Karte mit verfügbaren Orten wird angezeigt
			karteOrtAuswaehlen = new jvm.Map({
				container: $('#karte'),
				map: 'world_mill',
				scaleColors: ['#C8EEFF', '#0071A4'],
				normalizeFunction: 'polynomial',
				hoverOpacity: 0.7,
				hoverColor: false,
				markerStyle: {
					initial: {
						fill: '#E60A0A',
						stroke: '#96CEFA'
					}
				},
				onRegionTipShow: function(e){ e.preventDefault(); },
				backgroundColor: '#96CEFA',
				onMarkerClick : function(event, index) {
					ladeVisualisierung(orteIndex[index].locationid, orteIndex[index].name);
				}
			});
		});
	}
});

/**
 * Die Funktionen, die beim Start ausgefuehrt werden sollen
 **/
$(document).ready(function(){
	// Die Reiter der Navigationsleiste
	$('#reiter li a').click(function() {
		$('#reiter li').removeClass();
		$(this).parent().addClass('active');

		var id = this.getAttribute('id');
		
		// Aendere gegebenenfalls die Groesse der oberen Leisten
		if(id === 'reiterHome') {
			$("#projektName,#reiter,#SeiteOrtWahl").removeClass("small");
		} else {
			$("#projektName,#reiter,#SeiteOrtWahl").addClass("small");
		}
		
		// Schliesse Visualisuerung, falls offen
		if(visualisierung_activ) {
			visualisierung_activ = false;

			$("#ausgewaehlterOrt").hide().find("h4").text("");

			$("#visuBild").hide().empty();

			$("#karte").css({'position': 'static', 'bottom': '', 'left': ''});
			$("#textVisualisierungAnzeigen").show();
			$('#OrtWahl').parent().show();
			
			$('.VisualisierungDaten').hide();
		}
	});
	
	// Autocompletion fuer die Ortwahl
	$("#OrtName").autocomplete({
		source: function(request, response) {
			autocompletion.request(request.term, response);
			
			karteNeuerOrt.removeMarkers(karteNeuerOrtMarkers);
			
			karteNeuerOrtMarkers = [];
		},
		select: function(event, obj) {
			autocompletion.find(obj.item.value, function(array) {
				if(array.length === 0) return;
				
				var obj = array[0];
				
				lastCity = obj;
				
				_.id('latM').value = obj.lat;
				_.id('lonM').value = obj.lon;
				
				karteNeuerOrt.addMarker(obj.id, {'latLng': [obj.lat, obj.lon], 'name': obj.nm,
								'locationIdDB': obj.id});
				
				karteNeuerOrtMarkers.push(obj.id);
			});
		}
	});

	// Setze die Seite beim Start
	hidePages('SeiteHome');
	
	// Die Karte fuer das hinzufuegen bei neuen Orten
	karteNeuerOrt = new jvm.Map({
		container: $('#karte_neuerOrt'),
		map: 'world_mill',
		scaleColors: ['#C8EEFF', '#0071A4'],
		normalizeFunction: 'polynomial',
		hoverOpacity: 0.7,
		hoverColor: false,
		markerStyle: {
			initial: {
				fill: '#E60A0A',
				stroke: '#96CEFA'
			}
		},
		backgroundColor: '#96CEFA'
	});

	//Click-Funktion Home-Reiter
	$("#reiterHome").click(function() {
		hidePages('SeiteHome');
	});

	//Click-Funktion OrtAuswahl-Reiter
	$("#reiterOrtAuswahl").click(function() {
		hidePages('SeiteOrtWahl');
	});

	//Click-Funktion NeuerOrt-Reiter
	$("#reiterNeuerOrt").click(function() {
		hidePages('SeiteNeuerOrt');
	});
	
	$("#reiterImportmanagement").click(function() {
		hidePages('SeiteImportmanagement');
	});

	//Click-Funktion Keymanagement-Reiter
	$("#reiterKeymanagement").click(function () {
		hidePages ('SeiteKeymanagement');
	});
	
	//Neuen Ort einspeichern
	$("#SpeichernNeuerOrt").click(function() {
		if(lastCity === null) {
			autocompletion.find($("#OrtName").val(), function(array) {
				if(array.length === 0) {
					_.id('generalErrorMessage').innerHTML = 'Der Ort ist ungültig!';
					
					$('#generalError').modal('show');
					
					return;
				}
				
				var obj = array[0];
				
				lastCity = obj;
				
				_.id('latM').value = obj.lat;
				_.id('lonM').value = obj.lon;
				
				karteNeuerOrt.addMarker(obj.id, {'latLng': [obj.lat, obj.lon], 'name': obj.nm,
								'locationIdDB': obj.id});
				
				karteNeuerOrtMarkers.push(obj.id);
				
				$("#SpeichernNeuerOrt").click();
			});
			
			return;
		}
		
		var lat1, lat2, lon1, lon2, loaded = 0;
		var area = parseFloat($("#area").val());
		var latM = lastCity.lat;
		var lonM = lastCity.lon;
		var nameNeuerOrt = $("#OrtName").val();
		
		if(Number.isNaN(area) || area > 1000000 || area <= 0) {
			_.id('generalErrorMessage').innerHTML = 'Der Wert der Boundary-Box ist ungültig!';
			
			$('#generalError').modal('show');
			
			return;
		}
		if(nameNeuerOrt === '') {
			_.id('generalErrorMessage').innerHTML = 'Es wurde kein richtiger Name angegeben!';
			
			$('#generalError').modal('show');
			
			return;
		}
		
		var callback = function() {
			++loaded;
			
			if(loaded === 2) {
				datenbank.insertOrt(lastCity.id, lastCity.nm, lon1, lat1, lon2, lat2);
				
				karteOrtAuswaehlen.addMarker(lastCity.id, {'latLng': [lastCity.lat, lastCity.lon], 'name': lastCity.nm,
								'locationIdDB': lastCity.id});
				
				addOrt({'name': lastCity.nm, 'locationid': lastCity.id, 'lat1': lat1, 'lat2': lat2, 'long1': lon1, 'long2': lon2});
				
				_.id('myModalLabel2').innerHTML = 'Ort gespeichert';
				_.id('generalOkMessage').innerHTML = 'Der neue Ort "' + lastCity.nm + '" wurde gespeichert!';
				
				$('#generalOk').modal('show');
				
				lastCity = null;
				
				$("#OrtName").val('');
				$("#area").val('');
			}
		};
		
		// Berechne die anderen Position bei der Bounding Box
		geolocation.computeLatLon(latM, lonM, area, 45, function(obj) {
			lat1 = obj.lat;
			lon1 = obj.lon;
			
			callback();
		});
		geolocation.computeLatLon(latM, lonM, area, 225, function(obj) {
			lat2 = obj.lat;
			lon2 = obj.lon;
			
			callback();
		});
	});

	//Import starten
	$("#ImportStartenImporter").click(function() {
		if(_.id('dropdownImportOrt').importerCityId === undefined) {
			_.id('generalErrorMessage').innerHTML = 'Es wurde keine Stadt ausgewählt!';
			
			$('#generalError').modal('show');
			
			return;
		} else if(_.id('dropdownImportTyp').importerTypName === undefined) {
			_.id('generalErrorMessage').innerHTML = 'Es wurde kein Typ ausgewählt!';
			
			$('#generalError').modal('show');
			
			return;
		}
		
		python.start(orteIndex[_.id('dropdownImportOrt').importerCityId], _.id('dropdownImportTyp').importerTypName);
	});
	$("#ImportStoppenImporter").click(function() {
		python.stopAll();
	});
	
	//Eingabefelder für neue Keys ausblenden und erst nach Auswahl eines API-Typs auswählen
	$("#neuerTwitterKey").hide();
	$("#neuerOWMKey").hide();
	//OWM als API-Typ auswählen, Formular Twitter-Key ausblenden, Formular OWM-Key anzeigen
	$("#OWMKeyEingabeAnzeigen").click(function() {
		$("#neuerTwitterKey").hide();
		$("#neuerOWMKey").show();
	});
	//Twitter als API-Typ auswählen, Formular OWM-Key ausblenden, Formular Twitter-Key anzeigen
	$("#twitterKeyEingabeAnzeigen").click(function(){
		$("#neuerOWMKey").hide();
		$("#neuerTwitterKey").show();
	});
	//Twitter-Key Speichern
	$("#TwitterKeySpeichern").click(function() {
		daten.insertTwitterKey(_.id('twitterAPIKey').value, _.id('twitterAPISecret').value, _.id('accessToken').value, _.id('tokenSecret').value);
	});
	//OWM-Key Speichern
	$("#OWMKeySpeichern").click(function() {
		daten.insertOWMKey(_.id('OWMAPIKey').value);
	});
});
