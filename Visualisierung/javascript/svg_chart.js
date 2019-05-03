"use strict";

/**
 * Ein SVG Diagramm
 * 
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 * 
 * Author: BigData2
 * 
 * Nutzung:
 * new time_chart(datenquellen, einstellungen)
 * 
 * Details:
 * - siehe @usage
 * 
 **/

(function(root, name) {
	var old = root[name];
	
	/**
	 * Wrapperklasse fuer SVG Elemente
	 * @param obj Ein SVG Objekt
	 **/
	var svg = function(obj) {
		/**
		 * Fuegt dem Objekt einen Text hinzu
		 * @param text der Text
		 **/
		this.content = function(text) {
			obj.appendChild(document.createTextNode(text));
		};
		
		/**
		 * Loescht den Inhalt des Objektes und fuegt einen Text hinzu
		 * @param text der Text
		 **/
		this.changeContent = function(text) {
			obj.innerHTML = '';
			
			this.content(text);
		};
		
		/**
		 * Fuegt dem Objekt Attribute hinzu
		 * 
		 * 1. Moeglichkeit:
		 * @param name Der Name des Attributes
		 * @param wert Der Wert des Attributes
		 * 
		 * 2. Moeglichkeit:
		 * @param obj Ein Objekt mit den Attributen
		 **/
		this.attr = function() {
			if(arguments.length === 1) {
				var i;
				
				for(i in arguments[0]) {
					this.attr(i, arguments[0][i]);
				}
			} else {
				obj.setAttribute(arguments[0], arguments[1]);
			}
		};
	};
	
	/**
	 * Hilfsklasse fuer SVG Elemente
	 * 
	 * 1. Moeglichkeit:
	 * @param argument [String] Erstellt ein neues SVG Element anhand des Strings, z.B. "rect"
	 * (@param attr [Objekt]) Die Eigenschaften fuer das neue Objekt
	 * @return Das erstellte Objekt
	 * 
	 * 2. Moeglichkeit:
	 * @param obj Ein SVG Objekt
	 * @returm Das SVG Objekt eingepackt in die Wrapper Klasse
	 **/
	var _ = function(argument) {
		if((typeof argument) === 'string') {
			return _.create.apply(this, arguments);
		} else {
			return new svg(argument);
		}
	};
	
	root[name] = _;
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	/**
	 * Erstellt ein SVG Element
	 * 
	 * @param argument [String] Erstellt ein neues SVG Element anhand des Strings, z.B. "rect"
	 * (@param attr [Objekt]) Die Eigenschaften fuer das neue Objekt
	 * @return Das erstellte Objekt
	 **/
	_.create = function() {
		var tag = document.createElementNS('http://www.w3.org/2000/svg', arguments[0]);
		
		if(arguments.length > 1) {
			var name;
			
			for(name in arguments[1]) {
				if(name === 'content') {
					tag.appendChild(document.createTextNode(arguments[1][name]));
				} else {
					tag.setAttribute(name, arguments[1][name]);
				}
			}
		}
		
		return tag;
	};
	
	/**
	 * Erstellt ein HTML Element
	 * 
	 * @param argument [String] Erstellt ein neues Element anhand des Strings, z.B. "div"
	 * (@param attr [Objekt]) Die Eigenschaften fuer das neue Objekt
	 * @return Das erstellte Objekt
	 **/
	_.createHTML = function() {
		var tag = document.createElement(arguments[0]);
		
		if(arguments.length > 1) {
			var name;
			
			for(name in arguments[1]) {
				if(name === 'content') {
					tag.appendChild(document.createTextNode(arguments[1][name]));
				} else {
					tag.setAttribute(name, arguments[1][name]);
				}
			}
		}
		
		return tag;
	};
})(this, 'svg');

(function(root, name) {
	var old = root[name];
	
	/**
	 * Vervollstaendigt ein Objekt um fehlende Werte
	 * @param original [Objekt] das Objekt, das vervollstaendigt werden soll
	 * @param toAdd [Objekt] das Objekt, durch das das andere vervollstaendigt werden soll
	 * @return Das vervollstaendigte Objekt
	 **/
	var complete = function(original, toAdd) {
		var i;
		
		for(i in toAdd) {
			if((typeof toAdd[i]) === 'object') {
				if((typeof original[i]) !== 'object') {
					original[i] = {};
				}
				
				complete(original[i], toAdd[i]);
			} else {
				if(original[i] === undefined) {
					original[i] = toAdd[i];
				}
			}
		}
	};
	
	/**
	 * Ein Baum mit jeweils 10 Nachfolgern. Daten werden nur in den Blaettern gespeichert.
	 * Das Kompositum Pattern wird verwendet.
	 * @param baseVal Der Standartwert
	 * @param maxSize Die maximale Groesse. Eine Zehnerpotenz. Standard: 10000
	 **/
	var tenTree = function(baseVal, maxSize) {
		if(maxSize === undefined) {
			maxSize = 10000;
		} else {
			// Eine Zehnerpotenz, die >= 100 und <= 100000 ist
			maxSize = Math.max(Math.pow(Math.ceil(Math.log(Math.min(Math.abs(maxSize), 100000)) / Math.log(10)), 10), 100);
		}
		
		var tenTreeEntry;
		
		/**
		 * Ein Blatt in dem Baum
		 **/
		var tenTreeVal = function(val) {
			/**
			 * Fuegt einen Wert ein
			 * @param pos Die Position des Wertes
			 * @param newVal Der neue Wert
			 **/
			this.add = function(pos, newVal) {
				val = newVal;
				
				return this;
			};
			
			/**
			 * Gibt den Wert zurueck
			 **/
			this.get = function() {
				return val;
			};
			
			/**
			 * Setze den String zusammen
			 * @param pos Die Position dieses Eintrags
			 * @param maxWidth Die Breite des Diagramms
			 * @param posDiff Der maximale Abstand, den die Werte voneinander haben falls alle Werte vorhanden sind
			 * @param valData Die letzte Position, die einen Wert hatte
			 * @return Ein String, der einen Pfad fuer ein SVG <path> Objekt beschreibt
			 **/
			this.getValString = function(pos, maxWidth, posDiff, valData, computePosInScala) {
				var add = '', value = (computePosInScala === undefined) ? val : Math.round(computePosInScala(val));
				
				if(valData === -1 || (pos - valData) > posDiff * 2) {
					add = 'M ' + pos + ',' + baseVal + ' ';
					
					if(valData !== -1) {
						add = 'L ' + valData + ', ' + baseVal + ' Z ' + add;
					}
				}
				
				return [add + 'L ' + pos + ',' + value + ' ', pos];
			};
			
			/**
			 * Gibt den maximal Wert zurueck
			 **/
			this.getMax = function() {
				return val;
			};
		};
		
		/**
		 * Ein Abschluss in dem Baum
		 **/
		var tenTreeEnd = function(size) {
			/**
			 * Fuegt einen Wert ein
			 * @param pos Die Position des Wertes
			 * @param val Der Wert
			 **/
			this.add = function(pos, val) {
				if(size === 10) {
					return new tenTreeVal(val);
				}
				
				var newEntry = new tenTreeEntry(size / 10);
				
				newEntry.add(pos, val);
				
				return newEntry;
			};
			
			/**
			 * Gibt null zurueck
			 * @param pos Die Position dessen Wert gesucht ist
			 **/
			this.get = function(pos) {
				return null;
			};
		
			/**
			 * Setze den String zusammen; da hier kein Wert, gebe immer ['', valData] zurueck
			 * @param addPos Der Positionsabschnitt, den dieser Teilbaum besitzt
			 * @param maxWidth Die Breite des Diagramms
			 * @param posDiff Der maximale Abstand, den die Werte voneinander haben falls alle Werte vorhanden sind
			 * @param valData Die letzte Position, die einen Wert hatte
			 * @return Ein String, der einen Pfad fuer ein SVG <path> Objekt beschreibt
			 **/
			this.getValString = function(pos, maxWidth, posDiff, valData, computePosInScala) {
				return ['', valData];
			};
			
			/**
			 * Gibt den maximal Wert zurueck
			 **/
			this.getMax = function() {
				return Number.MIN_SAFE_INTEGER;
			};
		};
		
		/**
		 * Alle Abschluesse, die es geben kann
		 **/
		var tenTreeEnds = {};
		
		(function() {
			var i, size = 1;
			
			for(i=0;i<10;++i) {
				tenTreeEnds[size] = new tenTreeEnd(size);
				
				size *= 10;
			}
		})();
		
		/**
		 * Ein Objekt in der Mitte des Baumes
		 **/
		tenTreeEntry = function(size) {
			var children = [],
				changed = true,
				valString,
				valDataOld = [];
			
			var i;
			
			for(i=0;i<10;++i) {
				children[i] = tenTreeEnds[size];
			}
			
			/**
			 * Fuegt einen Wert ein
			 * @param pos Die Position des Wertes
			 * @param val Der Wert
			 **/
			this.add = function(pos, val) {
				changed = true;
				
				var entry = Math.floor(pos / (size / 10));
				
				children[entry] = children[entry].add(pos % (size / 10), val);
				
				return this;
			};
			
			/**
			 * Gibt einen Wert zurueck
			 * @param pos Die Position dessen Wert gesucht ist
			 **/
			this.get = function(pos) {
				return children[Math.floor(pos / (size / 10))].get(pos % (size / 10));
			};
		
			/**
			 * Setze den String zusammen
			 * @param addPos Der Positionsabschnitt, den dieser Teilbaum besitzt
			 * @param maxWidth Die Breite des Diagramms
			 * @param posDiff Der maximale Abstand, den die Werte voneinander haben falls alle Werte vorhanden sind
			 * @param valData Die letzte Position, die einen Wert hatte
			 * @return Ein String, der einen Pfad fuer ein SVG <path> Objekt beschreibt
			 **/
			this.getValString = function(addPos, maxWidth, posDiff, valData, computePosInScala) {
				if(!changed && valData === valDataOld[0]) {
					return [valString, valDataOld[1]];
				}
				
				valString = '';
				
				valDataOld[0] = valData;
				
				var i = 0, part;
				
				valData = ['', valData];
				
				for(i=0;i<10;++i) {
					part = addPos + i * size / 10;
					
					if(part <= maxWidth) {
						valData = children[i].getValString(part, maxWidth, posDiff, valData[1], computePosInScala);
						
						valString += valData[0];
					}
				}
				
				changed = false;
				
				valDataOld[1] = valData[1];
				
				return [valString, valData[1]];
			};
			
			/**
			 * Gibt den maximal Wert zurueck
			 **/
			this.getMax = function() {
				var i = 0, maxVal = Number.MIN_SAFE_INTEGER;
				
				for(i=0;i<10;++i) {
					maxVal = Math.max(maxVal, children[i].getMax());
				}
				
				return maxVal;
			};
		};
		
		var children = [],
			changed,
			valString;
		
		/**
		 * Fuegt einen Wert ein
		 * @param pos Die Position des Wertes
		 * @param val Der Wert
		 **/
		this.add = function(pos, val) {
			changed = true;
			
			var entry = Math.floor(pos / (maxSize / 10));
			
			children[entry] = children[entry].add(pos % (maxSize / 10), val);
		};
			
		/**
		 * Gibt einen Wert zurueck
		 * @param pos Die Position dessen Wert gesucht ist
		 **/
		this.get = function(pos) {
			return children[Math.floor(pos / (maxSize / 10))].get(pos % (maxSize / 10));
		};
		
		/**
		 * Setzt den Baum zureck/Leert den Baum
		 **/
		this.reset = function() {
			var i;
			
			for(i=0;i<10;++i) {
				children[i] = tenTreeEnds[maxSize];
			}
			
			changed = true;
		};
		
		/**
		 * Aendert den Standardwert; wichtig fuer die Skalierung in y-Richtung
		 * @param newBaseval neuer Standardwert
		 */
		this.setBaseval = function(newBaseval) {
			baseVal = newBaseval;
		};
		
		/**
		 * Setze den String fuer den Pfad zusammen
		 * @param maxWidth Die Breite des Diagramms
		 * @param posDiff Der maximale Abstand, den die Werte voneinander haben falls alle Werte vorhanden sind
		 * @param [computePosInScala] Die Funktion, die die Position in dem Diagramm berechnet
		 * @return Ein String, der einen Pfad fuer ein SVG <path> Objekt beschreibt
		 **/
		this.getValString = function(maxWidth, posDiff, computePosInScala) {
			if(!changed) {
				return valString;
			}
			
			valString = '';
			
			var i = 0, part, valData = ['', -1];
			
			for(i=0;i<10;++i) {
				part = i * maxSize / 10;
				
				if(part <= maxWidth) {
					valData = children[i].getValString(part, maxWidth, posDiff, valData[1], computePosInScala);
					
					valString += valData[0];
				}
			}
			
			if(valData[1] !== -1) {
				valString += 'L ' + valData[1] + ',' + baseVal + ' Z';
			}
			
			changed = false;
			
			return valString;
		};
			
		/**
		 * Gibt den maximal Wert zurueck
		 **/
		this.getMax = function() {
			var i = 0, maxVal = Number.MIN_SAFE_INTEGER;
			
			for(i=0;i<10;++i) {
				maxVal = Math.max(maxVal, children[i].getMax());
			}
			
			return maxVal;
		};
		
		this.reset();
	};
	
	// Ein Element, mithilfe dessen Berechnungen an anderen SVG Elementen getan werden koennen
	var calc_elem = svg('svg', {'style': 'position: absolute; top: -1000px; left: -1000px;', 'width': '500px', 'height': '500px', 'viewBox': '0 0 500 500'});
	
	// Das Element um den Pfad für das Diagramm zu bekommen
	var saveToElem = svg.createHTML('input', {'style': 'position: absolute; top: -1000px; left: -1000px;', 'type': 'file', 'nwsaveas': 'diagramm.svg'}),
		
		// Welches Diagramm gespeichert werden soll
		saveDiagramm = null;
	
	// Diagramm speichern
	root._.event(saveToElem, 'change', function() {
		var path = this.files[0].path;
		
		var content = saveDiagramm.parentNode.cloneNode(true), svg = content.getElementsByTagName('svg')[0];
		
		svg.removeChild(svg.getElementsByTagName('filter')[0]);
		svg.removeChild(svg.getElementsByTagName('text')[0]);
		svg.removeChild(svg.getElementsByTagName('g')[svg.getElementsByTagName('g').length - 1]);
		svg.style.cssText += 'font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;font-size: '
				+ getComputedStyle(saveDiagramm)['font-size'];
		
		var i, j, string = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + "\n" +
							'<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
							'xmlns="http://www.w3.org/2000/svg" version="1.1" ' +
							'xmlns:cc="http://creativecommons.org/ns#" ' +
							'xmlns:dc="http://purl.org/dc/elements/1.1/"';
		
		for(i=0,j=svg.attributes.length;i<j;++i) {
			string += ' ' + svg.attributes[i].name + '="' + svg.attributes[i].value.replace(/"/g, '\'') + '"';
		}
		
		string += '>';
		
		content = string + svg.innerHTML.replace(/<g>/g, "\n<g>\n").replace(/<\/g>/g, "\n</g>\n") + '</svg>';
		
		var fs = require('fs');
		
		fs.writeFile(path, content, function(err) {
			if(err) {
				root._.id('generalErrorMessage').innerHTML = 'Das Diagramm konnte nicht gespeichert werden (' + err + ')!';
				
				$('#generalError').modal('show');
			} else {
				root._.id('myModalLabel2').innerHTML = 'Diagramm gespeichert';
				root._.id('generalOkMessage').innerHTML = 'Das Diagramm wurde gespeichert!';
				
				$('#generalOk').modal('show');
			}
		});
		
		this.value = null;
	});
	
	/**
	 * Gibt die BoundindBox des SVG Elements zurueck
	 * @param elem [SVG Objekt]/[jQuery SVG Objekt] Das SVG Element
	 * @return die BoundindBox des SVG Elements
	 **/
	var calc_size = function(elem) {
		elem = (elem.getBBox === undefined) ? elem[0] : elem;
		
		// kopiere das Element
		elem = elem.cloneNode(true);
		
		calc_elem.appendChild(elem);
		
		var bbox = elem.getBBox();
		
		calc_elem.removeChild(elem);
		
		return bbox;
	};
	
	var monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
	
	/**
	 * Ein einfacher Container fuer die Daten der Diagramme; notwendig fuer die Verschiebung und die Ausblendung der Elemente, die ueber den
	 * Rand hinaus reichen
	 * @param width Die Breite des Containers
	 * @param height Die Hoehe des Containers
	 **/
	var containerSVG = function(width, height) {
		var g = svg('g');
		
		var svgElem = svg('svg', {'width': width, 'height': height});
		
		g.appendChild(svgElem);
		
		/**
		 * Gibt das oberste SVG Element zurueck
		 * @return
		 **/
		this.element = function() {
			return g;
		};
		
		/**
		 * Aendert die Groesse des Containers
		 * @param width die neue Groesse
		 **/
		this.resize = function(width) {
			svgElem.setAttribute('width', width);
		};
		
		/**
		 * Aendert die Groesse des Containers
		 * @param height die neue Groesse
		 **/
		this.resizeY = function(height) {
			svgElem.setAttribute('height', height);
		};
		
		/**
		 * Verschiebt den Container zu einem Wert x
		 * @param x Der Wert, wohin der Container verschoben werden soll
		 **/
		this.moveTo = function(x) {
			g.setAttribute('transform', 'translate(' + x + ', 0)');
		};
		
		/**
		 * Fuegt dem Container ein Element hinzu
		 * @param child das Element, das hinzugefuegt werden soll
		 **/
		this.append = function(child) {
			svgElem.appendChild(child);
		};
	};
	
	/**
	 * Die Beschreibung des Textes
	 * @param height [Number] die Hoehe des Diagramms
	 * @param textdescription [String] die Beschreibung
	 **/
	var description = function(height, textdescription) {
		var description = svg('text', {'content':  textdescription, 'dominant-baseline': 'middle', 'y': height / 2});
		
		/**
		 * Gibt die Breite zurueck, die die Beschriftung benoetigt
		 * @return
		 **/
		this.width = function() {
			return calc_size(description).width;
		};
		
		/**
		 * Aendert die Beschreibung
		 **/
		this.changeDescription = function(textdescription) {
			svg(description).changeContent(textdescription);
		};
		
		/**
		 * Aendert die Position der Beschreibung
		 * @param height die neue Gesamthoehe
		 **/
		this.resizeY = function(height) {
			description.setAttribute('y', height / 2);
		};
		
		/**
		 * Gibt das Element zurueck
		 * @return
		 **/
		this.element = function() {
			return description;
		};
	};
	
	/**
	 * Die Achsenbeschriftung
	 * @param height [Number] Die Hoehe des Diagramms
	 * @param minVal [Number] Der minimale Wert, der vorkommen kann
	 * @param maxVal [Number] Der maximale Wert, der vorkommen kann
	 * @param units [String] Die Einheit der Werte
	 **/
	var axis = function(data, height) {
		var axis = svg('g');
		
		// Die minimalen und maximalen Werten und die Einheiten
		var minVal = Math.floor((data.minVal() === undefined ? data.lineVal() : data.minVal()) * 100) / 100,
			maxVal = Math.ceil((data.maxVal() === undefined ? data.lineVal() : data.maxVal()) * 100) / 100,
			units = data.units('axisY');
		
		// Der Abstand zwischen dem Beschreibungstext und der Skala
		var textPadding = 5;
		
		var scalaPadding = data.scalaPadding(),
			scalaHeight = height - scalaPadding;
		
		// Die drei Texte neben der Skala
		var textMax = svg('text', {'content': maxVal + units, 'dominant-baseline': 'middle', 'y': scalaPadding, 'text-anchor': 'end',
									'font-size': '80%'});
		var textMid = svg('text', {'content': ((maxVal + minVal) / 2) + units, 'dominant-baseline': 'middle',
									'y': height / 2, 'text-anchor': 'end', 'font-size': '80%'});
		var textMin = svg('text', {'content': minVal + units, 'dominant-baseline': 'middle', 'y': scalaHeight, 'text-anchor': 'end',
									'font-size': '80%'});
		
		// Die Skala
		var scala = svg('polyline', {'points': '0,' + scalaHeight + ' 10,' + scalaHeight + ' 10,' + ((scalaHeight - scalaPadding) / 2 + scalaPadding)
									+ ' 0,' + ((scalaHeight - scalaPadding) / 2 + scalaPadding)
									+ ' 10,' + ((scalaHeight - scalaPadding) / 2 + scalaPadding)
									+ ' 10,' + scalaPadding + ' 0,' + scalaPadding,
									'style': 'fill: none; stroke: #000; stroke-width: 1px;'});
		
		// Berechnet die laengste Breite der Texte neben der Skala
		var width = Math.max(calc_size(textMax).width, calc_size(textMid).width, calc_size(textMin).width);
		
		// Setzt die Texte auf die richtige Position
		textMax.setAttribute('x', width);
		textMid.setAttribute('x', width);
		textMin.setAttribute('x', width);
		
		// Verschiebt die Skala auf die richtige x-Richtung
		scala.setAttribute('transform', 'translate(' + (width + textPadding) + ', 0)');
		
		// Fuegt die Elemente dem Gruppenelement hinzu
		axis.appendChild(textMin);
		axis.appendChild(textMid);
		axis.appendChild(textMax);
		axis.appendChild(scala);
		
		/**
		 * Gibt die Breite zurueck, die die Achsenbeschriftung benoetigt
		 * @return
		 **/
		this.width = function() {
			return calc_size(axis).width;
		};
		
		/**
		 * Aendert die Hoehe der Skala
		 * @param height die neue Gesamthoehe
		 **/
		this.resizeY = function(height) {
			textMid.setAttribute('y', height / 2);
			
			scalaHeight = height - scalaPadding;
			
			textMin.setAttribute('y', scalaHeight);
			
			scala.setAttribute('points', '0,' + scalaHeight + ' 10,' + scalaHeight + ' 10,' + ((scalaHeight - scalaPadding) / 2 + scalaPadding)
									+ ' 0,' + ((scalaHeight - scalaPadding) / 2 + scalaPadding)
									+ ' 10,' + ((scalaHeight - scalaPadding) / 2 + scalaPadding)
									+ ' 10,' + scalaPadding + ' 0,' + scalaPadding);
		};
		
		/**
		 * Gibt das Element zurueck
		 * @return
		 **/
		this.element = function() {
			return axis;
		};
	};
	
	/**
	 * Die Werte auf der Achse
	 * @param data [Datenquelle] Die Datenquelle
	 * @param timestamp [Number] Die Zeit die der rechte Rand des Diagramms wiederspiegeln soll
	 * @param zoom [Number] Die aktuelle Vergroesserung des Diagramms
	 * @param height [Number] Die Hoehe des Diagramms
	 * @param width [Number] Die Breite des Diagramms
	 **/
	var dataAxis = function(data, timestamp, zoom, height, width) {
		var axis = svg('g'), elements = svg('g');
		
		var maxVal = data.maxVal(),
			minVal = data.minVal(),
			scalaPadding = data.scalaPadding();
		
		if(maxVal === minVal) {
			minVal = data.lineVal();
			maxVal = minVal + 1;
		}
		
		/**
		 * Berechnet von einem Wert die Position in der Skala
		 * @param val Der Wert, dessen Position berechnet werden soll
		 * @return die Position in der Skala
		 **/
		var computePosInScala = function(val) {
			return (height - 2 * scalaPadding) * (1 - ((val - minVal) / (maxVal - minVal))) + scalaPadding;
		};
		
		// berechnet die y-Position der Linie
		var linePos = Math.round(computePosInScala(data.lineVal()));
		
		// Die Linie in dem Diagramm
		var line = svg('line', {'x1': '0', 'x2': width, 'y1': linePos, 'y2': linePos,
										'style': 'stroke: #000; stroke-width: 1px;'});
		
		// Die laenge des gesamten Diagramms
		var totalWidth = width;
		
		// Fuegt die Elemente hinzu
		axis.appendChild(line);
		axis.appendChild(elements);
		
		/**
		 * Gibt die Breite zurueck, die die Achsenbeschriftung benoetigt
		 * @return
		 **/
		this.width = function() {
			return width;
		};
		
		/**
		 * Gibt das Element zurueck
		 * @return
		 **/
		this.element = function() {
			return axis;
		};
		
		/**
		 * Berechnet die Position eines Timestamps auf der Skala
		 * @param time Der Timestamp
		 * @return die Position
		 **/
		var calcX = function(time) {
			var diff = timestamp - time,
				x = diff * 500 / 3600 / 24 / 30 * zoom;
			
			return width - x;
		};
		
		// Erstelle Baum, um die Daten zu speichern
		var vals = new tenTree(linePos),
			diagrammChangeNr = -1,
			secInterval;
		
		/**
		 * Erstellt einen Eintrag in dem Diagramm
		 * @param diagrammCreate: Wann das Diagramm erstellt werden sollte
		 * @param timestampFrom: Der Anfang des Balkens
		 * @param timestampTo: Der Ende des Balkens
		 * @param val: Der Wert, von dem ausgehen die Hoehe berechnet wird
		 * @param draw: Ob das Diagramm gezeichnet werden soll
		 * @param [max]: Der maximale Wert der angenommen werden kann
		 **/
		var createBar = function(diagrammCreate, timestampFrom, timestampTo, val, draw, max) {
			if(diagrammChangeNr !== diagrammCreate) {
				return;
			}
			
			if(!draw) {
				var x = Math.max(0, Math.round(calcX(timestampFrom))),
					widthBar = Math.round(calcX(timestampTo) - x);
					
				var mid = Math.floor(x + widthBar / 2);
				
				if(mid >= 0) {
					if('computePercentOfMax' in data) {
						vals.add(mid, val);
					} else {
						vals.add(mid, Math.round(computePosInScala(val)));
					}
				}
			}
			
			if(draw){
				if('computePercentOfMax' in data) {
					if(max !== undefined) {
						maxVal = max;
					}
					
					elements.appendChild(svg('path', {'d': vals.getValString(totalWidth, Math.ceil(calcX(timestampTo + secInterval) - calcX(timestampTo)),
																			computePosInScala),
													'style': 'fill: ' + (('color' in data) ? data.color() : '#00F') + '; stroke: #000; stroke-width: 1px;'}));
				} else {
					elements.appendChild(svg('path', {'d': vals.getValString(totalWidth, Math.ceil(calcX(timestampTo + secInterval) - calcX(timestampTo))),
													'style': 'fill: ' + (('color' in data) ? data.color() : '#00F') + '; stroke: #000; stroke-width: 1px;'}));
				}
				
				var elems = elements.getElementsByTagName('path');
				
				if(elems.length > 1) {
					var i = 0, j;
					
					for(j=elems.length - 1;i<j;++i) {
						elements.removeChild(elems[0]);
					}
				}
			}
		};
		
		// Referenzwerte fuer die Berechnung
		var calcedFrom = {};
		
		/**
		 * Berechnet die Werte fuer die Anzeige und laesst diese anzeigen
		 **/
		var calcValues = function() {
			// Loescht die aktuellen Daten
			vals.reset();
			
			// Leert die Anzeige
			elements.innerHTML = '';
			
			// Merke, dass das Diagramm veraendert wurde
			diagrammChangeNr = (diagrammChangeNr + 1) % 100000;
			
			// Die Zeit, die ein Pixel repraesentiert
			var timePerPixel = 1 / 500 * 30 / zoom * 3600 * 24;
			
			var leftBorder = timestamp - width / 500 * 30 / zoom * 3600 * 24, // Der linke Rand des Diagramms
				date = new Date(leftBorder * 1000), // Das Referenzdatum des linken Balkens
				referenceDate, // Das Referenzdatum
				sec, // Die Anzahl an Sekunden, die ein Balken repraesentiert
				repeat;
			
			if(timePerPixel <= 3600) {
				repeat = Math.ceil(timePerPixel / 600) * 10;
				
				if(repeat > 30) repeat = 60;
				
				referenceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), Math.floor(date.getMinutes() / repeat) * repeat, 0);
				
				sec = 60 * repeat;
			} else if(timePerPixel <= 86400) {
				repeat = Math.ceil(timePerPixel / 3600);
				
				if(repeat > 12) repeat = 24;
				else if(repeat > 6) repeat = 12;
				else if(repeat > 3) repeat = 6;
				
				referenceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(date.getHours() / repeat) * repeat, 0, 0);
				
				sec = 3600 * repeat;
			} else {
				referenceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
				
				sec = 172800;
			}
			
			var name = '_' + sec;
			
			// Berechne den Startpunkt von den ersten Referenz auf (im Verhaeltnis davon), damit nur einmal Daten pro Zoomstufe gecached werden
			if(name in calcedFrom) {
				var factor = Math.round((calcedFrom[name] - referenceDate.getTime() / 1000) / sec);
				
				referenceDate = calcedFrom[name] - factor * sec;
			} else {
				referenceDate = Math.floor(referenceDate.getTime() / 1000)
				calcedFrom[name] = referenceDate;
			}
			
			secInterval = sec;
			
			// Gibt die berechneten Werte weiter
			data.showData(referenceDate, Math.floor(timestamp),
						(function(nr) {
							return function(time1, time2, val, draw, max) { createBar(nr, time1, time2, val, draw, max); };
						})(diagrammChangeNr), sec);
		};
		
		/**
		 * Aendert die Breite des Diagramms
		 * @param widestDescription [Number] Die Breit des breitesten Beschreibung
		 * @param new_width [Number] Die gesamte Breite
		 **/
		this.resize = function(widestDescription, new_width) {
			width = new_width - widestDescription;
			
			totalWidth = new_width;
			
			// Berechne die Laenge der Linie neu
			svg(line).attr('x2', width);
			
			calcValues();
		};
		
		/**
		 * Zeichnet das Diagramm neu, z.B. nach Farbaenderung
		 **/
		this.drawAgain = function() {
			createBar(diagrammChangeNr, 0, 0, 0, true);
		};
		
		/**
		 * Aendert die Hoehe des Diagramms
		 * @param height die neue Gesamthoehe
		 **/
		this.resizeY = function(newHeight) {
			height = newHeight;
			
			linePos = Math.round(computePosInScala(data.lineVal()));
			
			line.setAttribute('y1', linePos);
			line.setAttribute('y2', linePos);
			
			vals.setBaseval(linePos);
			
			calcValues();
		};
		
		/**
		 * Aendere die Anzeigegroesse und gegebenenfalls die Anzeigedetails
		 * @param new_zoom [Number] Der neue Vergroesserungswert
		 * @param new_timestamp [Number] Der timestamp des rechten Randes
		 **/
		this.zoom = function(new_zoom, new_timestamp) {
			zoom = new_zoom;
			timestamp = new_timestamp;
			
			calcValues();
		};
		
		/**
		 * Berechnet den Wert an der Stelle x im Diagramm
		 * @param x Die Position im Diagramm
		 * @param elem Das Element, zu dem das Ergebnis hinzugefuegt werden soll
		 */
		this.val = function(x, elem) {
			data.getValAt(timestamp - (totalWidth - x) / 500 * 30 / zoom * 3600 * 24, elem);
		};
	};
	
	/**
	 * Ein Diagramm
	 * @param data [Datenquelle] Die Datenquelle
	 * @param timestamp [Number] Die Zeit die der rechte Rand des Diagramms wiederspiegeln soll
	 * @param zoom [Number] Die aktuelle Vergroesserung des Diagramms
	 * @param height [Number] Die Hoehe des Diagramms
	 * @param width [Number] Die Breite des Diagramms
	 **/
	var chartSingle = function(data, timestamp, zoom, height, width) {
		var group = svg('g');
		
		var descriptionE = new description(height, data.description());
		
		var axisE = new axis(data, height);
		
		var dataAxisE = new dataAxis(data, timestamp, zoom, height, 10);
		
		var descriptionPadding = 5;
		
		axisE.element().setAttribute('transform', 'translate(' + (descriptionE.width() + descriptionPadding) + ', 0)');
		
		var dataAxisEParent = new containerSVG(width - (descriptionE.width() + descriptionPadding), height);
		
		dataAxisEParent.moveTo(descriptionE.width() + descriptionPadding + axisE.width());
		
		group.appendChild(descriptionE.element());
		group.appendChild(axisE.element());
		group.appendChild(dataAxisEParent.element());
		
		dataAxisEParent.append(dataAxisE.element());
		
		// Die breitestes Beschreibung, die in dem ganzen Diagramm vorkommt
		var widestDescription;
		
		/**
		 * Gibt das Element zurueck
		 * @return
		 **/
		this.element = function() {
			return group;
		};
		
		/**
		 * Gibt die Breite zurueck, die die Achsenbeschriftung benoetigt
		 * @return
		 **/
		this.widthDescription = function() {
			return (descriptionE.width() + descriptionPadding + axisE.width());
		};
		
		/**
		 * Aendert die Breite des Diagramms
		 * @param new_widestDescription [Number] Die breitestes Beschreibung eines Diagramms
		 * @param width [Number] Die neue Breite des Diagramms
		 **/
		this.resize = function(new_widestDescription, width) {
			widestDescription = new_widestDescription;
			
			svg(axisE.element()).attr('transform', 'translate(' + (widestDescription - axisE.width()) + ', 0)');
			
			dataAxisEParent.resize(width - widestDescription);
			dataAxisEParent.moveTo(widestDescription);
			
			dataAxisE.resize(widestDescription, width);
		};
		
		/**
		 * Aendert die Hoehe des Diagramms
		 * @param height die neue Gesamthoehe
		 **/
		this.resizeY = function(height) {
			dataAxisEParent.resizeY(height);
			descriptionE.resizeY(height);
			axisE.resizeY(height);
			dataAxisE.resizeY(height);
		};
		
		/**
		 * Zeichnet das Diagramm neu, z.B. nach Farbaenderung
		 **/
		this.drawAgain = function() {
			dataAxisE.drawAgain();
		};
		
		/**
		 * Aendere die Anzeigegroesse und gegebenenfalls die Anzeigedetails
		 * @param zoom [Number] Der neue Vergroesserungswert
		 * @param timestamp [Number] Der timestamp des rechten Randes
		 * @param reset Ob die Verschiebung zurueckgesetzt werden soll
		 **/
		this.zoom = function(zoom, timestamp, reset) {
			if(reset) svg(dataAxisE.element()).attr('transform', 'translate(0, 0)');
			
			dataAxisE.zoom(zoom, timestamp);
		};
		
		/**
		 * Gibt den Wert an der Stelle x zurueck
		 * @return
		 **/
		this.val = function(x, elem) {
			return dataAxisE.val(x, elem);
		};
		
		/**
		 * Verschiebt den Graphen um einen Wert x
		 **/
		this.moveBy = function(x) {
			svg(dataAxisE.element()).attr('transform', 'translate(' + x + ', 0)');
		};
	};
	
	/**
	 * Ein zeitliche Achse
	 * @param timestamp [Number] Die Zeit die der rechte Rand des Diagramms wiederspiegeln soll
	 * @param zoom [Number] Die aktuelle Vergroesserung des Diagramms
	 * @param height [Number] Die Hoehe des Diagramms
	 * @param width [Number] Die Breite des Diagramms
	 **/
	var chartTime = function(timestamp, zoom, height, width) {
		var group = svg('g');
		
		var dataAxisE = svg('g');
		var dateElements = svg('g');
		
		var descriptionPadding = 10;
		
		var line = svg('line', {'x1': '0', 'y1': descriptionPadding, 'y2': descriptionPadding,
								'style': 'stroke: #000; stroke-width: 1px;'});
		
		dataAxisE.appendChild(line);
		dataAxisE.appendChild(dateElements);
		
		var totalWidth;
		
		var widestDescription;
		
		var dataAxisEParent = new containerSVG(width, height);
		
		group.appendChild(dataAxisEParent.element());
		
		dataAxisEParent.append(dataAxisE);
		
		/**
		 * Gibt das Element zurueck
		 * @return
		 **/
		this.element = function() {
			return group;
		};
		
		/**
		 * Gibt die Breite zurueck, die die Achsenbeschriftung benoetigt, da es allerdings keine gibt, ist dieser Wert 0.
		 * @return
		 **/
		this.widthDescription = function() {
			return 0;
		};
		
		/**
		 * Fuegt die Eintraege in der Anzeige hinzu
		 **/
		var buildEntries = function() {
			dateElements.innerHTML = '';
			
			// Den Zeitrahmen, den 100 Pixel repraesentieren
			var valPer100Pixel = Math.floor(100 / 500 * 30 / zoom * 3600 * 24),
				
				// nextVal wird ein Objekt, das die naechsten Werte kennt
				nextVal,
				
				// Die Daten fuer nextVal
				mask = {},
				
				// Der rechte Rand der Skala
				date = new Date(timestamp * 1000),
				
				// Ob die kleinen Unterteilungen an sind oder nicht
				small = false;
			
			// Berechne die Werte der Skala
			if(valPer100Pixel >= 8000000) {
				mask.init = new Date(date.getFullYear() + 1, 0, 1, 0, 0, 0);
				mask.next = function(now) { return new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0); };
				mask.content = function(now) { return now.getFullYear(); };
				
				small = true;
				
				mask.initStroke = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0);
				mask.nextStroke = function(now) { return new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0); };
			} else if(valPer100Pixel >= 600000) {
				mask.initStroke = mask.init = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0);
				mask.nextStroke = mask.next = function(now) { return new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0); };
				mask.content = function(now) { return monate[now.getMonth()]; };
				
				if(valPer100Pixel < 2000000) {
					small = true;
					
					mask.initStroke = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0);
					mask.nextStroke = function(now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0); };
				}
			} else if(valPer100Pixel >= 20000) {
				mask.initStroke = mask.init = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0);
				mask.nextStroke = mask.next = function(now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0); };
				mask.content = function(now) { return now.getDate(); };
				
				if(valPer100Pixel < 100000) {
					small = true;
					
					mask.initStroke = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, 0, 0);
					mask.nextStroke = function(now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, 0, 0); };
				}
			} else {
				mask.init = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, 0, 0);
				mask.next = function(now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, 0, 0); };
				mask.content = function(now) { return now.getHours(); };
				
				mask.initStroke = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, 0, 0);
				mask.nextStroke = function(now) { return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, 0, 0); };
			}
			
			// Erstellt nextVal
			nextVal = new function() {
				var now = mask.init;
				var nowStroke = new Date(mask.initStroke.getTime());
				
				this.now = function() {
					return now.getTime() / 1000;
				};
				this.next = function() {
					now = mask.next(now);
					
					return now.getTime() / 1000;
				};
				this.nextStroke = function() {
					nowStroke = mask.nextStroke(nowStroke);
					
					return nowStroke.getTime() / 1000;
				};
				this.content = function() {
					return mask.content(now);
				};
			};
			
			//Ob die kleinen und großen Striche aufeinanderliegen
			var same,
				
				// Die x Position, die eine Zeit auf der Skala hat
				calcX = function(time) {
					return width - (timestamp - time) * 500 / 3600 / 24 / 30 * zoom;
				},
				
				// Der x Wert des aktuellen grossen Striches
				x = calcX(nextVal.now()),
				
				// Der x Wert des naechsten grossen Striches
				nextX = calcX(nextVal.next()),
				
				// Der Text, der dazwischen dargestellt werden soll
				content = nextVal.content(),
				
				// Der x Wert des naechsten Striches
				stroke = calcX(nextVal.nextStroke());
			
			while(x > 0 && stroke > 0) {
				same = Math.abs(stroke - nextX) < 5 && small;
				
				dateElements.appendChild(svg('line', {'y1': descriptionPadding - 5, 'y2': (same ? 15 : 5) + descriptionPadding - 5,
														'x1': stroke, 'x2': stroke, 'style': 'stroke: #000; stroke-width: 1px;'}));
				
				dateElements.appendChild(svg('text', {'content': content,
														'y': descriptionPadding + 5, 'x': nextX + (x - nextX) / 2, 'text-anchor': 'middle',
														'dominant-baseline': 'text-before-edge',
														'font-size': '80%'}));
				
				if(stroke === nextX) {
					x = nextX;
					
					nextX = calcX(nextVal.next());
					
					content = nextVal.content();
				}
				
				stroke = calcX(nextVal.nextStroke());
			}
		};
		
		/**
		 * Macht nichts
		 **/
		this.drawAgain = function() {};
		
		/**
		 * Aendert die Breite des Diagramms
		 * @param new_widestDescription [Number] Die breitestes Beschreibung eines Diagramms
		 * @param new_width [Number] Die neue Breite des Diagramms
		 **/
		this.resize = function(new_widestDescription, new_width) {
			widestDescription = new_widestDescription;
			
			totalWidth = new_width;
			
			width = new_width - widestDescription;
			
			dataAxisEParent.resize(width);
			dataAxisEParent.moveTo(widestDescription);
			
			svg(line).attr('x2', width);
			
			buildEntries();
		};
		
		/**
		 * Aendert nichts
		 * @param height die neue Gesamthoehe
		 **/
		this.resizeY = function(height) {
		};
		
		/**
		 * Berechnet den Wert an der Stelle x
		 * @param x Die Position
		 * @param elem Das Element, das den Wert anzeigen soll
		 **/
		this.val = function(x, elem) {
			// Berechne den Timestamp der Position
			x = (totalWidth - x) / 500 * 30 / zoom * 3600 * 24;
			
			var datum = new Date((timestamp - x) * 1000), output;
			
			/**
			 * Fuegt einem Wert eine fuehrende 0 hinzu, falls diese < 10 ist.
			 * @param val Der Wert
			 **/
			var add0 = function(val) {
				return (val < 10 ? '0' + val : val);
			};
			
			// Das Zeitinterval, das ein einzelner Pixel repraesentiert
			var valPerPixel = Math.floor(1 / 500 * 30 / zoom * 3600 * 24);
			
			// Die Ausgabe
			output = datum.getFullYear();
			
			if(valPerPixel <= 86400) {
				output = add0(datum.getDate()) + '.' + add0(datum.getMonth() + 1) + '.' + output;
				
				if(valPerPixel <= 3600) {
					if(valPerPixel <= 60) {
						output += add0(datum.getHours()) + ':' + add0(datum.getMinutes());
					} else {
						var vorher = new Date(datum.getTime() - valPerPixel * 500),
							nachher = new Date(datum.getTime() + valPerPixel * 500);
						
						if(vorher.getFullYear() !== nachher.getFullYear() || vorher.getMonth() !== nachher.getMonth()
								|| vorher.getDate() !== nachher.getDate()) {
							output = add0(vorher.getDate()) + '.' + add0(vorher.getMonth() + 1) + '.' + vorher.getFullYear() +
									' ' + add0(vorher.getHours()) + ':' + add0(vorher.getMinutes()) + ' - '
									+ add0(nachher.getDate()) + '.' + add0(nachher.getMonth() + 1) + '.' + nachher.getFullYear() +
									' ' + add0(nachher.getHours()) + ':' + add0(nachher.getMinutes());
						} else {
							output += ' ' + add0(vorher.getHours()) + ':' + add0(vorher.getMinutes()) + ' - '
									+ add0(nachher.getHours()) + ':' + add0(nachher.getMinutes());
						}
					}
				} else {
					if(valPerPixel <= 10800) {
						output += ' ' + ['00:00-03:00', '03:00-06:00', '06:00-09:00', '09:00-12:00',
										'12:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-24:00'][Math.floor(datum.getHours() / 3)];
					} else if(valPerPixel <= 21600) {
						output += ' ' + ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-24:00'][Math.floor(datum.getHours() / 6)];
					} else if(valPerPixel <= 43200) {
						output += ' ' + ['00:00-12:00', '12:00-24:00'][Math.floor(datum.getHours() / 12)];
					}
				}
				if(valPerPixel <= 60) {
					output += ':' + add0(datum.getMinutes());
				}
			} else {
				output = monate[datum.getMonth()] + ' ' + output;
			}
			
			svg(elem).changeContent(output);
		};
		
		/**
		 * Aendere die Anzeigegroesse und gegebenenfalls die Anzeigedetails
		 * @param new_zoom [Number] Der neue Vergroesserungswert
		 * @param new_timestamp [Number] Der timestamp des rechten Randes
		 * @param reset Ob die Verschiebung zurueckgesetzt werden soll
		 **/
		this.zoom = function(new_zoom, new_timestamp, reset) {
			zoom = new_zoom;
			timestamp = new_timestamp;
			
			if(reset) dataAxisE.setAttribute('transform', 'translate(0, 0)');
			
			buildEntries();
		};
		
		/**
		 * Gibt den Timestamp zurueck, den die rechte Seite hätte bei einem bestimmtem Zoom,
		 * der Zeitpunkt an der Maus Position soll aber unveraendert bleiben
		 * @param new_zoom Der Zoom, bei dem die Werte berechnet werden sollen
		 * @param mouseX Die x-Position der Maus
		 **/
		this.getTimestampByZoom = function(new_zoom, mouseX) {
			if(new_zoom < zoom) {
				return (timestamp + (totalWidth - mouseX) / 500 * 30 / zoom * 3600 * 24);
			} else {
				return (timestamp - (totalWidth - mouseX) / 2 / 500 * 30 / zoom * 3600 * 24);
			}
		};
		
		/**
		 * Verschiebt den Graphen um einen Wert x
		 * @param die Verschiebung
		 **/
		this.moveBy = function(x) {
			svg(dataAxisE).attr('transform', 'translate(' + x + ', 0)');
		};
		
		/**
		 * Berechnen den Timestamp des rechten Randes bei einer Verschiebung um x
		 * @param die Verschiebung
		 **/
		this.getTimeBy = function(x) {
			return timestamp - x / 500 * 30 / zoom * 3600 * 24;
		};
	};
	
	/**
	 * Das ganze Diagramm
	 * @param data [Array] Die Datenquellen
	 * @param data [Objekt] Die Optionen fuer das Diagramm
	 **/
	var chart = function(data, options) {
		// Falls keine Optionen eingetragen wurde, erstelle ein leeres Objekt
		if(options === undefined || options === null) {
			options = {};
		}
		
		// Ergaenze die Optionen um die fehlenden Werte
		complete(options, {'margin': [10, 140, 10, 10], 'height': 100, 'width': 800, 'padding': 10,
							'heightTimeChart': 30,
							'zoom': 1, 'timestamp': (new Date().getTime()) / 1000});
		
		// Das Elternelemnt
		var group = svg('svg', {'height': options.height + 'px', 'width': options.width + 'px', 'viewBox': '0 0 ' + options.width + ' ' + options.height});
		
		// Der Speichernbutton
		var save = svg('text', {'y': options.margin[0], 'x': options.width - options.margin[3],
				'text-anchor': 'end', 'dominant-baseline': 'hanging',
				'style': 'font-family: \'Glyphicons Halflings\'; cursor: pointer; font-size: 30px;'});
		
		root._(save).on('click', function() {
			saveDiagramm = group;
			
			saveToElem.dispatchEvent(new Event('click'));
		}).on('mouseover', function() {
			save.setAttribute('fill', '#00A');
		}).on('mouseout', function() {
			save.removeAttribute('fill');
		});
		
		save.innerHTML = '&#xe175;';
		
		group.appendChild(save);
		
		// Erstellt einen Filter und fuegt ihn hinzu
		{
			var filter = svg('filter', {'id': 'dropshadow', 'height': '130%'});
			
			filter.appendChild(svg('feGaussianBlur', {'in': 'SourceAlpha', 'stdDeviation': '2'}));
			filter.appendChild(svg('feOffset', {'dx': '3', 'dy': '-3', 'result': 'offsetblur'}));
			
			var component = svg('feComponentTransfer');
			
			component.appendChild(svg('feFuncA', {'type': 'linear', 'slope': '0.8'}));
			
			filter.appendChild(component);
			
			var merge = svg('feMerge');
			
			merge.appendChild(svg('feMergeNode'));
			merge.appendChild(svg('feMergeNode', {'in': 'SourceGraphic'}));
			
			filter.appendChild(merge);
			
			group.appendChild(filter);
		}
		
		var charts = [], // Das einzelnen Teildiagramme
		
			// Die brauchbare Hoehe
			practicalHeight = options.height - options.margin[0] - options.margin[2] - options.heightTimeChart - options.padding,
			
			// Die brauchbare Breite
			practicalWidth = options.width - options.margin[1] - options.margin[3],
			
			// Die Summe der ganzen Hoehen
			heightSum = 0;
		
		/**
		 * Berechnet die Summe der height Angaben bei den Datenquellen
		 **/
		var computeHeightSum = function() {
			var i, j;
			
			heightSum = 0;
			
			for(i=0,j=data.length;i<j;++i) {
				heightSum += ('height' in data[i]) ? data[i].height : 1;
			}
		};
		
		computeHeightSum();
		
		var i, j = data.length,
			
			// Die Hoehe eines einzelnen Diagramms
			heightChart = Math.floor((practicalHeight - (j - 1) * options.padding) / heightSum),
			
			// Die groesste Breite einer Beschreibung
			maxDescriptionWidth = 0;
		
		var lineDisplay = svg('g'), lineDisplayText = [];
		
		var heightNow = 0, heightData;
		
		// Fuege alle Elemente hinzu
		for(i=0,j=data.length;i<j;++i) {
			heightData = ('height' in data[i]) ? data[i].height : 1;
			
			charts[i] = new chartSingle(data[i], options.timestamp, options.zoom, heightChart * heightData, practicalWidth);
			
			maxDescriptionWidth = Math.max(charts[i].widthDescription(), maxDescriptionWidth);
			
			// Berechne Position
			charts[i].element().setAttribute('transform', 'translate(' + options.margin[3] + ', ' +
											(heightNow * heightChart + (i + 1) * options.padding) + ')');
			
			heightNow += heightData;
			
			group.appendChild(charts[i].element());
		}
		
		// Erstelle die Zeitleiste
		charts[i] = new chartTime(options.timestamp, options.zoom, options.heightTimeChart, practicalWidth);
		
		group.appendChild(charts[i].element());
		
		charts[i].element().setAttribute('transform', 'translate(' + options.margin[3] + ', ' +
											(heightNow * heightChart + (i + 1) * options.padding) + ')');
		
		// Passt alle Diagramme an
		for(i=0,j=charts.length;i<j;++i) {
			charts[i].resize(maxDescriptionWidth, practicalWidth);
		}
		
		// Ob die Linie mit den einzelnen Daten aktiv ist oder nicht
		var lineActive = false;
		
		// Das Element, das die Linie mit den Daten beinhaltet
		var lineDisplay = svg('g', {'display': 'none'}), lineDisplayText = [];
		
		// Die Linie dazu
		var line = svg('line', {'y1': options.margin[0], 'y2': options.height - options.margin[2], 'x1': 0, 'x2': 0,
								'style': 'stroke: #000; stroke-width: 1px;'});
		
		lineDisplay.appendChild(line);
		
		group.appendChild(lineDisplay);
		
		// Fuegt das Textfeld hinzu mit dem aktuellen Wert
		for(i=0,j=charts.length,heightNow=0;i<j;++i) {
			lineDisplayText[i] = svg('text', {'x': 10, 'y': (heightNow * heightChart + (i + 1) * options.padding)});
			
			lineDisplay.appendChild(lineDisplayText[i]);
			
			heightNow += (i in data) ? (('height' in data[i]) ? data[i].height : 1) : 1;
		}
		
		var mousePressed = false, // Speichert, ob momentan die Maustaste gedrueckt ist
			mousePosByDown = []; // Die Mauspositionen, bei denen die Maus gedrueckt wurde
		
		// Der aktuelle Zoom
		var actuelZoom = options.zoom;
		
		/**
		 * Gibt das Element zurueck
		 * @return
		 **/
		this.element = function() {
			return group;
		};
		
		/**
		 * Aendert die Breite des Diagramms
		 * @param width [Number] Die neue Breite des Diagramms
		 **/
		this.resize = function(width) {
			options.width = width;
			
			group.setAttribute('width', width);
			group.setAttribute('viewBox', '0 0 ' + options.width + ' ' + options.height);
			
			practicalWidth = options.width - options.margin[1] - options.margin[3];
			
			for(i=0,j=charts.length;i<j;++i) {
				charts[i].resize(maxDescriptionWidth, practicalWidth);
			}
			
			save.setAttribute('width', options.width - options.margin[3]);
		};
		
		/**
		 * Aendert die Hoehe des Diagramms
		 * @param height die neue Gesamthoehe
		 **/
		this.resizeY = function(height) {
			computeHeightSum();
			
			options.height = height;
			
			group.setAttribute('height', height);
			group.setAttribute('viewBox', '0 0 ' + options.width + ' ' + options.height);
			
			practicalHeight = height - options.margin[0] - options.margin[2] - options.heightTimeChart - options.padding
			
			heightChart = height = Math.floor((practicalHeight - (data.length - 1) * options.padding) / heightSum);
			
			var i, j, heightNow = 0, heightData;
			
			for(i=0,j=charts.length;i<j;++i) {
				heightData = (i in data) ? (('height' in data[i]) ? data[i].height : 1) : 1;
				
				charts[i].element().setAttribute('transform', 'translate(' + options.margin[3] + ', '
											+ (heightNow * height + (i + 1) * options.padding) + ')');
				
				charts[i].resizeY(height * heightData);
				
				lineDisplayText[i].setAttribute('y', heightNow * height + (i + 1) * options.padding);
				
				heightNow += heightData;
			}
		};
		
		/**
		 * Passt die Positionen der Diagramme an
		 **/
		function adjustPosition() {
			maxDescriptionWidth = 0;
			
			for(i=0,j=data.length;i<j;++i) {
				maxDescriptionWidth = Math.max(charts[i].widthDescription(), maxDescriptionWidth);
			}
			
			this.resize(options.width);
			
			this.resizeY(options.height);
		};
		
		/**
		 * Zeichnet das Diagramm neu, z.B. nach Farbaenderung
		 **/
		this.drawAgain = function() {
			var i, j;
			
			for(i=0,j=charts.length;i<j;++i) {
				charts[i].drawAgain();
			}
		};
		
		/**
		 * Fuegt ein einzelnes Diagramm an einer Position ein
		 * @param dataNew Die Daten fuer das neue Diagramm
		 * @param position Die Position, an der das Diagramm eingefuegt werden soll
		 **/
		this.addData = function(dataNew, position) {
			if((typeof position) !== 'number') return;
			
			if(position > data.length || position < 0) return;
			
			data.splice(position, 0, dataNew);
			
			charts.splice(position, 0, new chartSingle(dataNew, options.timestamp, options.zoom, heightChart, practicalWidth));
			
			group.insertBefore(charts[position].element(), charts[charts.length - 1].element());
			
			lineDisplayText.splice(position, 0, svg('text', {'x': 10}));
			
			lineDisplay.appendChild(lineDisplayText[position]);
			
			adjustPosition.call(this);
		};
		
		/**
		 * Loescht ein einzelnes Diagramm an einer Position
		 * @param position Die Position, die geloescht werden soll
		 **/
		this.removeData = function(position) {
			if((typeof position) !== 'number') return;
			
			if(position < data.length) {
				data.splice(position, 1);
			}
			
			group.removeChild(charts[position].element());
			
			charts.splice(position, 1);
			
			lineDisplayText[position].parentNode.removeChild(lineDisplayText[position]);
			
			lineDisplayText.splice(position, 1);
			
			adjustPosition.call(this);
		};
		
		/**
		 * Aendere die Anzeigegroesse und gegebenenfalls die Anzeigedetails
		 * @param zoom [Number] Der neue Vergroesserungswert
		 * @param timestamp [Number] Der timestamp des rechten Randes
		 **/
		this.zoom = function(zoom, timestamp) {
			options.timestamp = timestamp;
			
			options.zoom = zoom;
			
			actuelZoom = zoom;
			
			for(i=0,j=charts.length;i<j;++i) {
				charts[i].zoom(zoom, timestamp, !mousePressed);
			}
		};
		
		/**
		 * Zeigt die Linie mit den einzelnen Werten
		 **/
		var showLine = function() {
			if(!lineActive) {
				lineActive = true;
				
				lineDisplay.style.display = 'block';
				
				group.style.cursor = 'move';
			}
		};
		
		/**
		 * Verbirgt die Linie mit den einzelnen Werten
		 **/
		var hideLine = function() {
			if(lineActive) {
				lineActive = false;
				
				lineDisplay.style.display = 'none';
				
				group.style.cursor = 'default';
			}
		};
		
		// Speichert, ob die Maus ueber einem Diagramm ist
		var active = false;
		
		/**
		 * Gibt an, ob die Maus ueber dem Diagramm ist
		 * @return
		 **/
		this.mouseOver = function() {
			return active;
		};
		
		/**
		 * Gibt an, dass die Maus ueber dem Diagramm ist
		 * @param x Die x-Position im Diagramm
		 * @param y Die y-Position im Diagramm
		 **/
		this.mouseMove = function(x, y) {
			// Berechne, ob die Maus ueber den Werten ist oder nicht
			active = (x > options.margin[3] + maxDescriptionWidth && x < options.width - options.margin[1]
						&& y > options.margin[0] && y < options.height - options.margin[2]);
			
			var i, j;
			
			// Falls die Maus gedrueckt ist, verschiebe das Diagramm
			if(mousePressed) {
				hideLine();
				
				group.style.cursor = 'ew-resize';
				
				// Falls keine Verschiebung vorliegt, abbrechen
				if(x === mousePosByDown[0]) {
					return;
				}
				
				// Verschiebe das Diagramm
				for(i=0,j=charts.length;i<j;++i) {
					charts[i].moveBy(x - mousePosByDown[0]);
				}
				
				return;
			}
			
			// Falls die Linie mit den Werten nicht angezeigt werden soll
			if(!active) {
				hideLine();
				
				return;
			}
			
			// Zeige die Linie
			showLine();
			
			lineDisplay.setAttribute('transform', 'translate(' + x + ', 0)');
			
			// Ziehe den linken Rand ab
			x -= options.margin[3];
			
			// Gebe die Position an die einzelnen Diagramme weiter und das Element, in dem der Wert angezeigt werden soll
			for(i=0,j=charts.length;i<j;++i) {
				charts[i].val(x, lineDisplayText[i]);
			}
		};
		
		/**
		 * Gibt an, dass die Maus gedrueckt wuerde
		 **/
		this.mouseDown = function(x, y) {
			if(active) {
				mousePressed = true;
				
				mousePosByDown = [x, y];
			} else {
				mousePressed = false;
			}
		};
		
		/**
		 * Gibt an, dass die Maus losgelassen wurde
		 **/
		this.mouseUp = function(x, y) {
			if(!mousePressed) {
				return;
			}
			
			mousePressed = false;
			
			// Falls die Position anders ist als die urspruengliche Position, verschiebe das Diagramm
			if(mousePosByDown[0] !== x) {
				// Berechne den neuen rechten Rand
				var newTime = charts[charts.length - 1].getTimeBy(x - mousePosByDown[0]),
					i, j;
				
				options.timestamp = newTime;
				
				// Verschiebe die Diagramme
				for(i=0,j=charts.length;i<j;++i) {
					charts[i].zoom(actuelZoom, newTime, true);
				}
			}
			
			group.style.cursor = 'default';
		};
		
		/**
		 * Gibt an, dass die Maus nicht mehr ueber dem Diagramm ist
		 **/
		this.mouseOut = function() {
			hideLine();
		};
		
		/**
		 * Gibt den Timestamp zurueck, den die rechte Seite hätte bei einem bestimmtem Zoom
		 * @return
		 **/
		this.getTimestampByZoom = function(zoom, mouseX) {
			if(mousePressed) {// TODO verschiebe den Wert richtig
				mouseX = 2 * mouseX - mousePosByDown[0];
			}
			
			return charts[charts.length - 1].getTimestampByZoom(zoom, mouseX - options.margin[3]);
		};
	};
	
	/**
	 * Gibt die das BoundingClientRect des SVG Elements zurueck
	 **/
	var offsetVal = function(elem) {
		return elem.getBoundingClientRect();
	};
	
	/**
	 * @usage
	 * Die Hauptfunktion, erstellt ein Diagramm und gibt es zurueck
	 * 
	 * Aufbau einer Datenquelle:
	 * 	Objekt mit folgenden Methoden:
	 * 		String description(): gibt den Beschreibungstext der Datenquelle
	 * 		Number minVal(): Gibt den minimalen Wert zurueck
	 * 		Number maxVal(): Gibt den maximalen Wert zurueck
	 * 		Number lineVal(): Gibt den Wert zurueck, bei dem die Linie sein soll
	 * 		[Number height]: Die als wieviele einzelne Diagramme dieses von der Hoehe der gelten soll
	 * 		String units(String bereich): Gibt die Einheiten zurueck
	 *			bereich: Wo di Einheiten gefragt sind: getAtVal oder axisY
	 * 		Number scalaPadding(): Der Abstand ueber und unter dem Diagramm
	 * 		undefined getValAt(Number timestamp, SVGText elem):
	 *			timestamp: Der Timestamp, bei dem Wert gesucht ist
	 *			elem: Das SVG Text Element, bei dem der Wert eingefuegt werden soll
	 * 		undefined showData(Number timestampFrom, Number timestampTo,
									function(Number timestampFrom, Number timestampTo, Number val) createBar, Number sec):
	 *			timestampFrom: Der Zeitpunkt, ab dem die Daten angezeigt werden sollen
	 *			timestampTo: Der Zeitpunkt, bis zu dem die Daten angezeigt werden sollen
	 *			createBar: Die Methode, die einen Balken anzeigt
	 *				timestampFrom: Der Zeitpunkt, an dem der Balken anfaengt
	 *				timestampTo: Der Zeitpunkt, an dem der Balken aufhoert
	 *				val: Der Wert des Balken
	 *			sec: Die Anzahl an Sekunden, in denen das Zeitinterval aufgeteilt sein soll
	 * 
	 * Aufbau der Optionen:
	 * 	Objekt mit moeglichen Felder:
	 * 		Array margin: Der Rand des Diagrammes oben, recht, unten, links
	 * 		Number height: Die Gesamthoehe des Diagramms
	 * 		Number width: Die Gesamtbreite des Diagramms
	 * 		Number padding: Der Abstand zwischen den Diagrammen
	 * 		Number heightTimeChart: Die Hoehe des Zeitbalkens unten
	 * 		Number zoom: Der Zoom beim Start
	 * 		Number timestamp: Der Timestamp, der den rechten Rand beim Start repraesentiert
	 * 		
	 * @param data [Array] Die Datenquellen des Diagramms
	 * @param options [Objekt] Die Einstellungen fuer das Diagramm
	 **/
	var _ = function(data, options) {
		var created_chart = new chart(data, options),
			zoom = options.zoom || 1;
		
		// Erstelle die Events
		root._(created_chart.element()).on('mousemove', function(e) {
			e.stopPropagation();
			
			var offset = offsetVal(created_chart.element());
			
			created_chart.mouseMove(e.pageX - offset.left, e.pageY - offset.top);
			
			return false;
		}).on('mousedown', function(e) {
			e.stopPropagation();
			
			if(!created_chart.mouseOver()) {
				return;
			}
			
			var offset = offsetVal(created_chart.element());
			
			created_chart.mouseDown(e.pageX - offset.left, e.pageY - offset.top);
			
			return false;
		}).on('wheel', function(e) {
			e.stopPropagation();
			
			if(!created_chart.mouseOver()) {
				return;
			}
			
			var offset = offsetVal(created_chart.element());
			
			// Schraenke den Zoom ein auf einen minimalen und maximalen Wert
			if(e.wheelDelta > 0) {
				if(zoom >= 64) {
					return;
				}
				
				zoom *= 2;
				
				zoom = Math.min(64, zoom);
			} else {
				if(zoom <= 0.03125) {
					return;
				}
				
				zoom /= 2;
				
				zoom = Math.max(0.03125, zoom);
			}
			
			// Bereche den neuen rechten Rand
			var timestamp = created_chart.getTimestampByZoom(zoom, e.pageX - offset.left);
			
			created_chart.zoom(zoom, timestamp);
			
			return false;
		});
		
		root._.event(window, 'mouseup', function(e) {
			var offset = offsetVal(created_chart.element());
			
			created_chart.mouseUp(e.pageX - offset.left, e.pageY - offset.top);
		});
		
		return created_chart;
	};
	
	_.toString = function() {
		return 'Creates a time chart';
	};
	
	root[name] = _;
	
	_.noConflict = function() {
		root[name] = old;
		
		return _;
	};
	
	// Fuege bei dem Start des Skriptes das Element fuer die Berechnungen ein
	root._.addToStart(function() {
		document.getElementsByTagName('body')[0].appendChild(calc_elem);
		document.getElementsByTagName('body')[0].appendChild(saveToElem);
	});
})(this, 'time_chart');