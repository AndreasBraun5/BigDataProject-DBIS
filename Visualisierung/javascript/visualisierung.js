"use strict";

/**
 * Erstellt die Parameter fuer das Diagramm und erstellt dieses
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 **/

/**
 * Startet die Visualisierung
 * @param ort Der ID des Ortes
 * @param id Die ID des HTML Objektes, bei dem das Diagramm eingefuegt werden soll
 **/
function startVisualisierung(ort, id, idCheckbox) {
	/**
	 * Erstellt das Diagramm und fuegt es in der Seite ein
	 * @param maxVals ein Objekt mit dem maximalen Daten
	 * @param minVals ein Objekt mit dem minimalen Daten
	 * @param anzeigen Die Daten, die angezeigt werden koennen
	 * @param zeige Die Wetterdaten, die angezeigt werden sollen
	 **/
	function create(maxVals, minVals, anzeigen, zeige) {
		var data = [], i, j, k, l, chart,
			daten_cacheObjekts = {'objekts': {}}, zeigeAn = [];
		
		daten_cacheObjekts.get = function(name) {
			if(!(name in daten_cacheObjekts.objekts)) {
				daten_cacheObjekts.objekts[name] = new daten_cache(ort, name);
			}
			
			return daten_cacheObjekts.objekts[name];
		};
		
		// Erstellt die Parameter fuer das Diagramm
		for(i=0,j=anzeigen.length;i<j;++i) {
			(function(i) {
				data[i] = {'description': function() { return anzeigen[i].beschreibung; },
							'minVal': function() { return Math.min(anzeigen[i].line, minVals[anzeigen[i].name]); },
							'maxVal': function() { return Math.max(anzeigen[i].line, maxVals[anzeigen[i].name]); },
							'lineVal': function() { return anzeigen[i].line; },
							'units': anzeigen[i].units,
							'scalaPadding': function() { return 10; },
							'funktion': anzeigen[i].funktion,
							'height': ('height' in anzeigen[i]) ? anzeigen[i].height : 1,
							'color': function() { return '#0000FF'; },
							'showData': function(timestampFrom, timestampTo, createBar, sec) {
								daten_cacheObjekts.get(this.funktion).showData(timestampFrom, timestampTo, createBar, anzeigen[i].name, sec);
							}
						};
				
				if('computePercentOfMax' in anzeigen[i]) {
					data[i].computePercentOfMax = anzeigen[i].computePercentOfMax;
				}
				if('changeGetValAt' in anzeigen[i]) {
					data[i].getValAt = function(timestamp, elem) {
								var obj = this;
								
								daten_cacheObjekts.get(this.funktion).getNearest(timestamp, function(data) {
									if(data[anzeigen[i].name] !== undefined) {
										svg(elem).changeContent(anzeigen[i].changeGetValAt(data[anzeigen[i].name]) + obj.units('valAtLine'));
										
										return;
									}
									
									svg(elem).changeContent('N/A');
								});
							};
				} else {
					data[i].getValAt = function(timestamp, elem) {
								var obj = this;
								
								daten_cacheObjekts.get(this.funktion).getNearest(timestamp, function(data) {
									if(data[anzeigen[i].name] !== undefined) {
										svg(elem).changeContent(data[anzeigen[i].name] + obj.units('valAtLine'));
										
										return;
									}
									
									svg(elem).changeContent('N/A');
								});
							};
				}
				
			})(i);
		}
		
		for(i=0,j=zeige.length;i<j;++i) {
			zeigeAn.push(data[zeige[i]]);
		}
		
		// Erstelle das Diagramm
		chart = new time_chart(zeigeAn, {'width': fenster.getWidth() - 60, 'height': fenster.getHeight() - 126, 'zoom': 1, 'padding': 20});
		
		// Fuege es ein
		_.id(id).appendChild(chart.element());
		
		_.event(window, 'resize', function() {
			chart.resizeY(fenster.getHeight() - 126);
			chart.resize(fenster.getWidth() - 60);
		});
		
		var checkBoxDiv = $('#' + idCheckbox), div, label, input, inputGroup, inputGroupDiv, inputGroupInput, colorpick, lastClicked = null;
		
		checkBoxDiv.empty();
		
		colorpick = $('<input/>').attr({'type': 'color', 'id': 'colorpick'}).css({'position': 'absolute', 'left': '-5000px', 'top': '-5000px'});
		
		colorpick.on('change', function() {
			if(lastClicked !== null) {
				lastClicked.value = this.value;
				
				lastClicked.dispatchEvent(new Event('change'));
			}
		});
		
		checkBoxDiv.append(colorpick);
		
		// Erstelle die Auswahl der moeglichen Eintraege
		for(i=0,j=data.length;i<j;++i) {
			div = $('<div/>').addClass('checkbox');
			
			inputGroup = $('<div/>').addClass('input-group').append(
							$('<div/>').addClass('input-group-addon')
								.html('<span style="background-color: ' + (function(a) { return (a + '; color: ' + a); })(data[i].color()) + ';">&nbsp;</span>')
						);
						
			inputGroupInput = document.createElement('input');
			
			inputGroup.find('span').click((function(input) {
				return function() {
					lastClicked = input;
					
					colorpick.val(input.__last_valid_color__);
					
					colorpick.click();
				}
			})(inputGroupInput));
			
			_.event(inputGroupInput, 'change', (function(i, inputGroup) { return function() {
				if((this.value.length === 7) && (this.value.charAt(0) === '#')) {
					var allowed = '0123456789ABCDEFabcdef', j;
					
					for(j=1;j<this.value.length;++j) {
						if(allowed.indexOf(this.value.charAt(j)) === -1) {
							return;
						}
					}
				} else return;
				
				this.__last_valid_color__ = this.value;
				
				inputGroup.find('div:first span').css({'background-color': this.value, 'color': this.value});
				
				data[i].color = (function(val) { return function() { return val; }; })(this.value);
				
				chart.drawAgain();
			};})(i, inputGroup));
			
			inputGroupInput.__last_valid_color__ = '#0000FF';
			
			inputGroup.append($(inputGroupInput).attr({'type': 'text', 'class': 'form-control', 'placeholder': '#0000FF'}));
			
			inputGroupDiv = $('<div/>').addClass('input-group-addon');
			
			inputGroup.append(inputGroupDiv);
			
			div.append(inputGroup);
			
			input = $('<input/>').attr({'type': 'checkbox', 'class': 'checkbox_data'});
			
			for(k=0,l=zeige.length;k<l;++k) {
				if(zeige[k] === i) {
					input.attr('checked', '');
					
					k = l;
				}
			}
			
			input.on('change', (function(i) { return function() {
				for(k=0,l=zeige.length;k<l;++k) {
					if(zeige[k] === i) {
						chart.removeData(k);
						
						zeige.splice(k, 1);
						
						this.removeAttribute('checked');
						
						l = k;
					} else if(zeige[k] > i) {
						chart.addData(data[i], k);
						
						zeige.splice(k, 0, i);
						
						this.setAttribute('checked', '');
						
						l = k;
					}
				}
				
				if(k === l) {
					chart.addData(data[i], k);
					
					zeige.splice(k, 0, i);
					
					this.setAttribute('checked', '');
				}
			};})(i));
			
			inputGroupDiv.append(input).css('border-left', 'none');
			
			inputGroupDiv = $('<div/>').addClass('input-group-addon').text((data[i].twitter ? 'Twitterclient: ' : '') + data[i].description());
			
			inputGroup.append(inputGroupDiv);
			
			checkBoxDiv.append(div);
		}
	}
	
	// Das Array mit allen moeglichen Anzeigen
	var moeglicheAnzeigen =
		[{'beschreibung': 'Temperatur', 'name': 'temperatur', 'line': 0, 'units': function() { return ' °C'; }, 'funktion': 'getMultipleWetterdatenAVG'},
		{'beschreibung': 'Luftdruck', 'name': 'luftdruck', 'line': 1013, 'units': function() { return ' hP'; }, 'funktion': 'getMultipleWetterdatenAVG'},
		{'beschreibung': 'Bewölkung', 'name': 'wolken', 'line': 0, 'units': function() { return ' %'; }, 'funktion': 'getMultipleWetterdatenAVG'},
		{'beschreibung': 'Windrichtung', 'name': 'windrichtung', 'line': 0, 'units': function() { return ' °'; }, 'funktion': 'getMultipleWetterdatenAVG'},
		{'beschreibung': 'Windgeschwindigkeit', 'name': 'windgeschwindigkeit', 'line': 0, 'units': function() { return ' m/s'; }, 'funktion': 'getMultipleWetterdatenAVG'},
		{'beschreibung': 'Luftfeuchtigkeit', 'name': 'luftfeuchte', 'line': 0, 'units': function() { return ' %'; }, 'funktion': 'getMultipleWetterdatenAVG'}];
	
	var i = 0, j = moeglicheAnzeigen.length;
	
	for(i=0;i<j;++i) {
		moeglicheAnzeigen.groupBy = 'Wetterdaten';
	}
	
	var min = null, max = null, additional = {},
		
		// Falls alle Daten vorhanden sind, erstelle das Diagramm
		start = function() {
			if(min === null || max === null) return;
			
			var i, j, k, obj;
			
			for(i in additional) {
				if(additional[i].data === null) {
					return;
				}
			}
			
			for(i in additional) {
				for(j=0,k=additional[i].data.length;j<k;++j) {
					obj = {'beschreibung': additional[i].beschreibung(additional[i].data[j]),
											'name': additional[i].name(j, additional[i].data[j]),
											'line': additional[i].line,
											'units': additional[i].units,
											'groupBy': additional[i].groupBy,
											'funktion': additional[i].funktion};
					
					if('computePercentOfMax' in additional[i]) {
						obj.computePercentOfMax = true;
					}
					if('changeGetValAt' in additional[i]) {
						obj.changeGetValAt = additional[i].changeGetValAt;
					}
					
					moeglicheAnzeigen.push(obj);
					
					max[additional[i].name(j, additional[i].data[j])] = additional[i].max(additional[i].data[j]);
					min[additional[i].name(j, additional[i].data[j])] = additional[i].min(additional[i].data[j]);
				}
			}
			
			create(max, min, moeglicheAnzeigen, [0, 1, 2]);
		};
	
	// Fuege falls vorhanden Twitterdaten hinzu
	additional['twitter'] = {'data': null, 'maxFunktion': daten.getMaxTwitterSoftware, 'groupBy': 'Twitter', 'max': function(obj) { return 100; },
							'min': function(obj) { return 0; }, 'name': function(index, obj) { return 'twitter_' + obj.deviceinfo; },
							'line': 0, 'units': function(where) { return (where === 'valAtLine' ? ' Tweets' : ' %'); },
							'funktion': 'getMultipleTwitterdatenAVG', 'computePercentOfMax': true,
							'beschreibung': function(obj) { return obj.deviceinfo; }};
	
	// Fuege falls vorhanden Badegaestedaten hinzu
	additional['badegaeste'] = {'data': null, 'maxFunktion': daten.getMaxBadegaeste, 'groupBy': 'Schwimmbäder',
							'max': function(obj) { return obj.badegaeste; },
							'min': function(obj) { return 0; }, 'name': function(index, obj) { return 'badegaeste'; },
							'line': 0, 'units': function(where) { return ''; },
							'funktion': 'getMultipleBadegaeste',
							'beschreibung': function(obj) { return 'Badegäste ' + obj.badname; }};
	
	// Fuege falls vorhanden Auswertungsdaten hinzu
	additional['auswertung'] = {'data': null, 'maxFunktion': daten.getMaxAuswertung, 'groupBy': 'Auswertung',
							'max': function(obj) { return obj.wert; },
							'min': function(obj) { return 0; }, 'name': function(index, obj) { return 'auswertung_' + obj.name; },
							'line': 0, 'units': function(where) { return ''; },
							'funktion': 'getMultipleAuswertungAVG',
							'beschreibung': function(obj) { return 'Auswertung ' + obj.name; },
							'changeGetValAt': function(val) { return ('' + val).replace(/^(\d+)((\.\d{1,5})\d*)?$/g, '$1$3'); }};
	
	// Prueft, ob die Daten ok sind
	function testData(data) {
		var i, j = 0;
		
		for(i in data) {
			++j;
			
			if(data[i] === undefined || data[i] === null) {
				return false;
			}
		}
		
		return (j !== 0);
	}
	
	function dataOk(data) {
		var result = testData(data);
		
		if(!result) {
			_.id('generalErrorMessage').innerHTML = 'Zu diesem Ort existieren keine gueltigen Daten!';
			
			$('#generalError').modal('show');
			
			$('#reiterOrtAuswahl').click();
		}
		
		return result;
	}
	
	// Lade die maximalen Werte der Daten
	daten.getMaxWetterdaten(ort, function(err, data) {
		if(err === undefined) {
			if(!dataOk(data)) return;
			
			max = data;
			
			start();
		}
	});
	
	// Lade die minimalen Werte der Daten
	daten.getMinWetterdaten(ort, function(err, data) {
		if(err === undefined) {
			if(!dataOk(data)) return;
			
			min = data;
			
			start();
		}
	});
	
	// Lade die zusaetzlichen Daten
	for(i in additional) {
		additional[i].maxFunktion(ort, (function(additional) {
			return function(err, data) {
				if(err === undefined) {
					additional.data = data;
					
					start();
				}
			};
		})(additional[i]));
	}
}