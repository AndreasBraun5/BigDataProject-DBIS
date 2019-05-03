"use strict";

/**
 * Die GUI Logik
 *
 * geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
 *
 * Author: BigData2
 *
 **/

var visualisierung_activ = false,
	orte = {}, orteArray;

var ladeVisualisierung = function(id, text) {
	$("#karte").hide();
	$("#ausgewaehlterOrt span").show().find("b").text(text);
	$("#visuBild").show();

	if(visualisierung_activ) {
		$("#visuBild").empty();
	}

	visualisierung_activ = true;

	startVisualisierung(id, 'visuBild');
}

daten.getOrte(function(err, data) {
	if(err === undefined) {
		$(document).ready(function(){
			var i, j, namen = [], markers = [];

			orteArray = data;

			for(i=0,j=data.length;i<j;++i) {
				orte[data[i].name] = data[i];

				namen.push(data[i].name);

				markers.push({'latLng': [(data[i].lat1 + data[i].lat2) / 2, (data[i].long1 + data[i].long1) / 2], 'name': data[i].name,
								'locationIdDB': data[i].locationid});
			}

			namen.sort();

			var ul = $('#OrtWahl ul');

			for(i=0;i<j;++i) {
				ul.append($('<li/>').append($('<a/>').attr('id', 'OrtWahl_' + orte[namen[i]].locationid).attr('href', '#').text(namen[i])));
			}

			// Ort auswaehlen
			$("#OrtWahl li a").click(function() {
				ladeVisualisierung(this.getAttribute('id').split('_')[1], this.innerText);
				$("#checkBoxenDaten").show();
			});

			//Karte mit verfügbaren Orten wird angezeigt
			$("#karte").vectorMap({
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
					 backgroundColor: '#96CEFA',
					 markers: markers,
					 onMarkerClick : function(event, index) {
					 ladeVisualisierung(markers[index].locationIdDB, markers[index].name);
					 }
			});
		});
	}
});

$(document).ready(function(){

	$( "#OrtName" ).autocomplete({
		source: function(request, response) {
			autocompletion.request(request.term, response);
		},
		select: function(event, obj) {
			autocompletion.find(obj.item.value, function(array) {
				var obj = array[0];
				_.id("latM").value = obj.lat;
				_.id("lonM").value = obj.lon;
			});
		}
	});

  //beim Start wird die Home-Seite angezeigt, die anderen Seiten werden ausgeblendet
  $("#SeiteOrtWahl").hide();
  $("#SeiteNeuerOrt").hide();
	$("#SeiteImportmanagement").hide();

  //Visualisierungsbild und Checkboxen zur Auswahl der Daten werden auseblendet und erst nach Ortauswahl geladen
  $("#visuBild").hide();
	$("#checkBoxenDaten").hide();

  //Namen der Orte werden ausgeblendet und bei Auswahl eines Ortes oberhalb der Visualisierung eingeblendet
  $("#sueddeutschlandAusgewaehlt").hide();
  $("#londonAusgewaehlt").hide();
  $("#newYorkAusgewaehlt").hide();

  //Click-Funktion Home-Reiter
  $("#reiterHome").click(function() {
    $("#SeiteOrtWahl").hide();
    $("#SeiteNeuerOrt").hide();
		$("#SeiteImportmanagement").hide();
    $("#SeiteHome").show();
  });

  //Click-Funktion OrtAuswahl-Reiter
  $("#reiterOrtAuswahl").click(function() {
    $("#SeiteHome").hide();
    $("#SeiteNeuerOrt").hide();
		$("#SeiteImportmanagement").hide();
    $("#SeiteOrtWahl").show();
  });

  //Click-Funktion NeuerOrt-Reiter
  $("#reiterNeuerOrt").click(function() {
    $("#SeiteHome").hide();
    $("#SeiteOrtWahl").hide();
		$("#SeiteImportmanagement").hide();
    $("#SeiteNeuerOrt").show();
  });

	//Click-Funktion Importmanagement-Reiter
	$("#reiterImportmanagement").click(function() {
		$("#SeiteHome").hide();
		$("#SeiteOrtWahl").hide();
		$("#SeiteNeuerOrt").hide();
		$("#SeiteImportmanagement").show();
	});

  //Angeklickten Reiter farbig hinterlegen
  $(function() {
     $('#reiter li a').click(function() {
        $('#reiter li').removeClass();
        $(this).parent().addClass('active');

			if(this.getAttribute('id') === 'reiterHome') {
				$("#projektName,#reiter,#SeiteOrtWahl").removeClass("small");
			} else {
				$("#projektName,#reiter,#SeiteOrtWahl").addClass("small");
			}

			if(visualisierung_activ) {
				visualisierung_activ = false;

				$("#ausgewaehlterOrt span").hide().find("b").text("");

				$("#visuBild").hide().empty();

				$("#karte").show();
			}
    });
  });

	//Neuen Ort einspeichern
	$("#SpeichernNeuerOrt").click(function() {
		var lat1, lat2, lon1, lon2;
		var area = parseFloat($("#area").val());
		var latM = parseFloat($("#latM").val());
		var lonM = parseFloat($("#lonM").val());
		var nameNeuerOrt = $("#OrtName").val();
		lat1 = ( latM + (0.063547 / 10000 * area) );
		lat2 = ( latM - (0.063547 / 10000 * area) );
		lon1 = ( lonM + (0.098955 / 10000 * area) );
		lon2 = ( lonM - (0.098955 / 10000 * area) );
	  alert("Längengrad 1 ist " + lat1 + "\nLängengrad 2 ist " + lat2 + "\nBreitengrad 1 ist " + lon1 + "\nBreitengrad 2 ist " + lon2);
		alert("PID NeuerOrt    " + nameNeuerOrt + area);
	});

	//Immporte aktualisieren
	$("#ImporteAktualisieren").click(function() {
		alert("Importe werden aktualisiert.....");
	});
	//Immport starten
	$("#ImportStarten").click(function() {
		alert("Import wird gestartet.....");
	});



});
