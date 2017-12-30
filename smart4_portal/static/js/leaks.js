Proj4js.defs["EPSG:27700"] = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs";
	
var map;
var key1layer;
var key2layer;
var key1feature;
var key2feature;
var currentSelectedFeature;
var layerWards;
var args;
var permalink;

var debug = 0;
var votes = new Array();

var styleMap = new OpenLayers.StyleMap(
	{"default": new OpenLayers.Style({pointRadius: "${radius}", fillColor: "${fillColor}", fillOpacity: "${fillOpacity}", strokeWidth: 0.1, strokeColor: "#888888" }),
	 "select": new OpenLayers.Style({strokeColor: "#000000", strokeOpacity: 1.0, strokeWidth: 4 })}
);
	
var partyDetails = {
	"c":["Conservative", "#0000ff", "Conservative", "Conservative Party"],
	"l":["Labour", "#ff0000", "Labour", "Labour Party"],
	"d":["Liberal Democrats", "#ff7700", "Lib Dems", "Liberal Democrats"],
	"g":["Green", "#00aa00", "Green", "Green Party"],
	"u":["UK Independence Party", "#6600ff", "UKIP", "UKIP"],
	"b":["BNP", "#aa0077", "BNP", "BNP"],
	"r":["Respect-Unity Coalition", "#772200", "Respect", "Respect-Unity Coalition"],
	"p":["Christian Peoples Alliance", "#006666", "CPA", "Christian Peoples Alliance"],
	"t":["Trade Unionist and Socialist Coalition", "#772200", "TUSC", "TUSC"],
	"f":["Tower Hamlets First", "#772200", "THF", "Tower Hamlets First"],
	"o":["Other Parties/Independents", "#000000", "Other", "Other/Independent"]
};

function initMap() 
{
    map = new OpenLayers.Map ("mapcontainer", 
    {
        restrictedExtent: new OpenLayers.Bounds(-2, 50.5, 2, 52.5).transform("EPSG:4326", "EPSG:900913"),
		projection: "EPSG:900913",
		displayProjection: "EPSG:4326",

    });
	  
	//LAYERS 
    var layerSV = new OpenLayers.Layer.OSM("", "http://tiles.oobrien.com/londongrey/${z}/${x}/${y}.png", 
	{  
	    type: "png",
   	    numZoomLevels: 14,
   	    attribution: "" //handled elsewhere
	});

	layerWards = new OpenLayers.Layer.Vector("Wards", { styleMap: styleMap });
	layerWards.events.on({
	"featureselected": function(e) {
		$('#infoboxtop').html("<h1 title='Ward ID: " + e.feature.ward + "'>" + wards[e.feature.borough][e.feature.ward][0] + "</h1><h2 title='Borough ID: " + e.feature.borough + "'>" + boroughs[e.feature.borough][0] + "</h2>");
		if (currentSelectedFeature != null)
		{
			selectControl.unselect(currentSelectedFeature);
			currentSelectedFeature == null;				
		}
		currentSelectedFeature = e.feature;
		refreshStatBox();
		},
		"featureunselected": function(e) {			
			currentSelectedFeature = null;
			refreshStatBox();
		}
	});

    map.addLayer(layerSV);
	map.addLayer(layerWards);

	var wardLL = "";
	for (borough in boroughs)
	{
		
		for (var ward in wards[borough])
		{
			var wardLL = new OpenLayers.LonLat(wards[borough][ward][1], wards[borough][ward][2]).transform("EPSG:27700", "EPSG:900913"); 
			var wardPoint = new OpenLayers.Geometry.Point(wardLL.lon, wardLL.lat);						
			var feature = new OpenLayers.Feature.Vector(wardPoint);
			feature.borough = borough;
			feature.ward = ward;
			feature.attributes.radius = 5; //Temporary, until we load the correct values in later.
			layerWards.addFeatures([feature]);
		}
	}

	//CONTROLS
	permalink = new OpenLayers.Control.Permalink( "permalink", null, { 'anchor': true, div:$("#permalink"), "createParams":myCreateArgs });
	map.addControl(permalink);

	var key1map = new OpenLayers.Map ("key1", { controls:[] });	
	key1feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(0, 0));	
	key1feature.attributes.radius = 2;
	key1layer = new OpenLayers.Layer.Vector("", { styleMap: styleMap, isBaseLayer: true });
	key1layer.addFeatures([key1feature]);
	
	key1map.addLayer(key1layer);
	key1map.setCenter(new OpenLayers.LonLat(0, 0), 0);
	
	var key2map = new OpenLayers.Map ("key2", { controls:[] });	
	key2feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(0, 0));	
	key2feature.attributes.radius = 2;
	key2layer = new OpenLayers.Layer.Vector("", { styleMap: styleMap, isBaseLayer: true });
	key2layer.addFeatures([key2feature]);
	
	key2map.addLayer(key2layer);
	key2map.setCenter(new OpenLayers.LonLat(0, 0), 0);

	selectControl = new OpenLayers.Control.SelectFeature(layerWards, { });
	map.addControl(selectControl);
	selectControl.activate();

	//DEFAULTS
	if (map.getZoom() == 0)
	{
			setLocation(51.5, -0.1, 11);
	}

	//EVENTS
    map.events.register("zoomend", null, setZoomLimit);
}

function loadOptions()
{
	var url = window.location.href
	var index = url.indexOf('#');
    if (index > 0)
    {
            url = '?' + url.substring(index + 1, url.length);
	}
	
	args = OpenLayers.Util.getParameters(url);
	
	//Set up drop-down values.
	for (party in partyDetails)
	{
		$("#party").append($('<option>', { value : party }).text(partyDetails[party][0])); 
	}

	//Reset defaults
	if (args['party'] && args['party'] != "")
	{
		$("#party").val(args['party']);
		$("#other").val("");
	}
	else if (args['other'] && args['other'] != "")
	{
		$("#other").val(args['other']);
		$("#party").val("");
	}
	else
	{
		$("#other").val("colour");
		$("#party").val("");
	}
	
	if (args['year'] && args['year'] != "")
	{
			if (args['year'] == '2006')
			{
					$("#year2006").prop({'checked': true});
			}
			if (args['year'] == '2010')
			{
					$("#year2010").prop({'checked': true});
			}
			if (args['year'] == '2014')
			{
					$("#year2014").prop({'checked': true});
			}
	}
	else
	{
		$("#year2014").prop({'checked': true});
	}	
	
	votes["2006"] = votes2006;
	votes["2010"] = votes2010;
	votes["2014"] = votes2014;
}

function changeParty()
{
	if ($("#party").val() == "")
	{
		$("#other").val("colour");
	}
	else
	{
		$("#other").val("");
	}
	updateFeatures();
}

function changeOther()
{
	if ($("#other").val() == "")
	{
		$("#party").val("c");	
	}
	else
	{
		$("#party").val("");
	}
	updateFeatures();
}

function compareVotesArr(a, b)
{
	return b[1] - a[1];
}

function refreshStatBox()
{	
	if (currentSelectedFeature != null && currentSelectedFeature.metric >= 0)
	{
		var html = "";

		var partyS = $('#party').val();
		var otherS = $('#other').val();
		var year = $("input[name='year']:checked").val();

		html += "<table>";

		var selectedVotes = new Array();

		for (partyID in votes[year][currentSelectedFeature.borough][currentSelectedFeature.ward])
		{
			for (partyVote in votes[year][currentSelectedFeature.borough][currentSelectedFeature.ward][partyID])
			{
				selectedVotes.push([partyID, votes[year][currentSelectedFeature.borough][currentSelectedFeature.ward][partyID][partyVote][0], votes[year][currentSelectedFeature.borough][currentSelectedFeature.ward][partyID][partyVote][1]]);
			}
		}

		selectedVotes.sort(compareVotesArr);
		for (var i = 0; i < selectedVotes.length; i++)
		{
			var partyID = selectedVotes[i][0];
			if (partyDetails[partyID] !== undefined)
			{
				var colour = partyDetails[partyID][1];
				if (otherS == "colour" || otherS == "colour3")
				{
					if (partyID != "c" && partyID != "l")
					{
						colour = "#00ff00";
					}
				}
				if ((otherS == "colour3" && selectedVotes[i][2] == 1) || partyS == partyID)
				{
					//console.log(selectedVotes);
					html += "<tr style='background-color: #444444'>";
				}
				else
				{
					html += "<tr>";
				}

				html += "<td style='background-color: " + colour + "; width: 5px;'>&nbsp</td><td>" 
					+ partyDetails[partyID][3] + "</td><td>" 
					+ selectedVotes[i][1] + "</td></tr>";
			
			}
		}
		
		html += "</table>";
		$('#infobox').css({"display": "block"});
		$('#infoboxbottom').html(html);						
	} 	
	else
	{
		$('#infobox').css({"display": "none"});
	}
}

function updateFeatures()
{
	if ($("#party").val() == "" && $("#other").val() == "")
	{
		clearFeatures();
		return;
	}

	var partyS = $('#party').val();
	var otherS = $('#other').val();
	var year = $("input[name='year']:checked").val();

	for (var i = 0; i < layerWards.features.length; i++)
	{
		var feature = layerWards.features[i];
	
		if (votes[year][feature.borough] == null || votes[year][feature.borough][feature.ward] == null)
		{ 
			//No results available for this ward.
			feature.metric = -1;
			feature.partyID = "";
			feature.attributes.fillColor = "#000000";

		}
		else if (partyS != "")
		{
			if (votes[year][feature.borough][feature.ward][partyS] != null)
			{
				totalVote = 0;
				var partyVotes = votes[year][feature.borough][feature.ward][partyS];
				for (partyVote in partyVotes)
				{
					totalVote += votes[year][feature.borough][feature.ward][partyS][partyVote][0];
				}
				feature.metric = totalVote;
				feature.partyID = partyS;
				feature.attributes.fillColor = partyDetails[partyS][1];
			}
			else
			{
				feature.metric = -1;
			}
		} 

		else
		{
			var lvotes = 0.0;
			var cvotes = 0.0;
			var ovotes = 0.0;

			var parties = votes[year][feature.borough][feature.ward];
			for (party in parties)
			{
				var partyvotes = votes[year][feature.borough][feature.ward][party];
				for (vote in partyvotes)
				{
					if (otherS == "colour")
					{
						if (party == "l")
						{
							lvotes += votes[year][feature.borough][feature.ward][party][vote][0];
						}
						else if (party == "c")
						{
							cvotes += votes[year][feature.borough][feature.ward][party][vote][0];
						}
						else
						{
							ovotes += votes[year][feature.borough][feature.ward][party][vote][0];
						}
					}
					else if (otherS == "colour3" && votes[year][feature.borough][feature.ward][party][vote][1] == "1")
					{
						if (party == "l")
						{
							lvotes += 1;
						}
						else if (party == "c")
						{
							cvotes += 1;
						}
						else
						{
							ovotes += 1;
						}
					}
				}
			}
			var total = (lvotes+cvotes+ovotes)*1.0;
			var lprop = lvotes/total;
			var cprop = cvotes/total;
			var oprop = ovotes/total;

			var skewFactor = 1.0;
			var boundary = 1.0/3.0;
			if (otherS == "colour3")
			{
				skewFactor = 0.0; //Just clean. 
			}
			//Emphasise extreme values so they look less "grey".
			lprop = enhanceAndClean(lprop, skewFactor, boundary);
			cprop = enhanceAndClean(cprop, skewFactor, boundary);
			oprop = enhanceAndClean(oprop, skewFactor, boundary);

			var colourHex = rgb2Hex(lprop, oprop, cprop);
			feature.metric = total/2000; //Average of ~5.
			if (otherS == "colour3")
			{
				feature.metric = total/0.67; //Average of ~5.
			}
			if (total == 0) //Typically when an election is postponed.
			{
				feature.metric = 4;
			}
			feature.partyID = "";
			feature.attributes.fillColor = "#" + colourHex;
		}
	}

	refreshStatBox();
 	updateCircleSizesAndKeys();
}

function clearFeatures()
{
	for(var i = 0; i < layerWards.features.length; i++)
	{
		layerWards.features[i].metric = -1;
	}
	refreshStatBox();
	updateCircleSizesAndKeys();
}

function updateCircleSizesAndKeys()
{
	var partyColour = "#000000";
	var scaling = 7.5;
	//console.log(map.getZoom());
	if (map.getZoom() < 12)
	{
		scaling = scaling * 0.6;
	}
	if (map.getZoom() < 11 && map.getZoom() != 0)
	{
		scaling = scaling * 0.7;
	}
	if ($("#party").val() != "")
	{
		scaling = scaling/30.0;
	} 

	for (var i = 0; i < layerWards.features.length; i++)
	{
		var feature = layerWards.features[i];
		var metric = feature.metric;
		var pointRadius = 0;
		if (metric > 0)
		{	
			pointRadius = Math.round(scaling*Math.sqrt(metric));							
			if (pointRadius < 2)
			{
				pointRadius = 2;
			}
			if (pointRadius > 300)
			{
				pointRadius = 300;
			}
		}
	
		feature.attributes.radius = pointRadius;
		feature.attributes.fillOpacity = 0.6;
		feature.attributes.strokeOpacity = 0.75;
	}
	layerWards.redraw(true);
	permalink.updateLink();
	
	
	var metric1 = 0;
	var metric2 = 0;
	$("#key1cap").html("");
	$("#key2cap").html("");

	$("#colourKey").css({"display": "none"});
	$("#regularKey").css({"display": "block"});

	var otherS = $("#other").val();
	var partyS = $("#party").val();

	if (otherS == "colour" || otherS == "colour3")
	{
		metric1 = 5;
		metric2 = 5;
	}
	
	else if (partyS != "")
	{
		metric1 = 10000;
		metric2 = 5000;
	}
	
	if (otherS == "colour" || otherS == "colour3")
	{
		$("#colourKey").css({"display": "block"});
		$("#regularKey").css({"display": "none"});
	}
	else if (partyS != "")
	{
		key1feature.partyID = partyS;
		key2feature.partyID = partyS;
		$("#key1cap").html("" + metric1 + " votes for<br />" + partyDetails[partyS][0]);
		$("#key2cap").html("" + metric2 + " votes for<br />" + partyDetails[partyS][0]);
	}

	var pointRadius = Math.round(scaling*Math.sqrt(metric1));
	key1feature.attributes.radius = pointRadius;
	key1feature.attributes.fillOpacity = 0.8;
	if (key1feature.partyID != null)
	{
		key1feature.attributes.fillColor = partyDetails[key1feature.partyID][1];
	}
	key1layer.removeAllFeatures();
	key1layer.addFeatures([key1feature]); //Don't use drawFeature due to IE display bug.

	var pointRadius = Math.round(scaling*Math.sqrt(metric2));
	key2feature.attributes.radius = pointRadius;
	key2feature.attributes.fillOpacity = 0.8;
	if (key2feature.partyID != null)
	{
		key2feature.attributes.fillColor = partyDetails[key2feature.partyID][1];
	}
	key2layer.removeAllFeatures();
	key2layer.addFeatures([key2feature]);	
}

function setZoomLimit()
{
	if (map.getZoom() < 10) { map.setCenter(map.getCenter(), 10); }
	if (map.getZoom() > 13) { map.setCenter(map.getCenter(), 13); }
	updateFeatures();
}

function setLocation(lat, lon, zoom)
{
    var startPoint = new OpenLayers.LonLat(lon, lat);   
    map.setCenter(startPoint.transform("EPSG:4326", "EPSG:900913"), zoom);
}

function myCreateArgs()
{
	var args = OpenLayers.Control.Permalink.prototype.createParams.apply(this, arguments);

	var party = $('#party').val();
	var other = $('#other').val();
	var year = $("input[name='year']:checked").val();

	args['party'] = party;
	args['other'] = other;
	args['year'] = year;
	return args;
}

/* UTILITY FUNCTIONS */

//RatioNum between 0 and 1. Skew factor 0 = no effect. Boundary is the neutral value, between 0 and 1.
function enhanceAndClean(ratioNum, skewFactor, boundary)
{
	if (ratioNum < boundary)
	{
		ratioNum = ratioNum * Math.pow(ratioNum*(1.0/boundary), skewFactor);
	}
	else
	{
		ratioNum = 1.0 - (1.0-ratioNum) * Math.pow((1.0-ratioNum)*1.0/(1.0-boundary), skewFactor);
	}

	//Fix extremes to prevent conversion problems.
	if (ratioNum < 0.001)
	{
		ratioNum = 0.001;
	}
	if (ratioNum > 0.999)
	{
		ratioNum = 0.999;
	}	
	return ratioNum;
}

//RGB values between 0 and 1.
function rgb2Hex(r, g, b)
{
	var colourHex = "";
	var hexArray = new Array( "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" );
	var code1 = Math.floor(r*16);
	var code2 = Math.floor(r*256) - code1*16;
	colourHex += hexArray[code1];
	colourHex += hexArray[code2];
	var code1 = Math.floor(g*16);
	var code2 = Math.floor(g*256) - code1*16;
	colourHex += hexArray[code1];
	colourHex += hexArray[code2];
	var code1 = Math.floor(b*16);
	var code2 = Math.floor(b*256) - code1*16;
	colourHex += hexArray[code1];
	colourHex += hexArray[code2];
	return colourHex;
}

$( document ).ready(function()
{	
	loadOptions();
	initMap();		
    updateFeatures(); 
});
