//function oneachfeature(feature, layer) {
//	if (feature.properties && feature.properties.popupContent) {
//		popupContent = feature.properties.popupContent;
//		layer.bindPopup(popupContent);
//	}
//}
//
//function featurestyle(feature) {
//	console.log(feature.properties);
//	return feature.properties.style;
//}
//
//function refreshoverlay(map, geojsonLayer) {
//	var bbox=map.getBounds();
//
//	var url="/cgi-bin/geojson?bbox="
//		+ bbox.getWest() + "," 
//		+ bbox.getNorth() + ","
//		+ bbox.getEast() + ","
//		+ bbox.getSouth() + ","
//		+ map.getZoom();
//
//	geojsonLayer.refresh(url);
//}
//
var map;
var popup = L.popup();

var mStart;
var pStart;
var mDestination;
var pDestination;

function onEachFeature(feature, layer) {
	console.log(feature);
}

var styleA = {
	"color": "#00aa00",
	"weight": 5,
	"opacity": 0.65
};

var styleB = {
	"color": "#aa0000",
	"weight": 5,
	"opacity": 0.65
};

function routeAdd(data, style) {
	if (!data || data.code != 'Ok') {
		return;
	}

	json=data.routes[0].geometry;

	return L.geoJSON(json, {
		onEachFeature: onEachFeature,
		style: style
	}).addTo(map);
}


var layerA;
var layerB;

function routeCalc(s, e) {
	if (!s || !e) {
		return;
	}

	$.getJSON("/osrma/route/v1/car/" + s.lng + "," + s.lat + ";" + e.lng + "," + e.lat + "?geometries=geojson", function(data) {
		if (layerA) {
			map.removeLayer(layerA);
		}
		layerA=routeAdd(data, styleA);
	});

	$.getJSON("/osrmb/route/v1/car/" + s.lng + "," + s.lat + ";" + e.lng + "," + e.lat + "?geometries=geojson", function(data) {
		if (layerB) {
			map.removeLayer(layerB);
		}
		layerB=routeAdd(data, styleB);
	});
}

function onMapClick(e) {
	if (!mStart) {
		pStart=e.latlng;
		mStart=L.marker(e.latlng, { draggable: true });
		mStart.addTo(map);

		mStart.on("drag", $.throttle(function(e) {
			pStart=e.target.getLatLng();
			routeCalc(pStart, pDestination);
		}, 100));


	} else if (!mDestination) {
		pDestination=e.latlng;
		mDestination=L.marker(e.latlng, { draggable: true });
		mDestination.addTo(map);

		mDestination.on("drag", $.throttle(function(e) {
			pDestination=e.target.getLatLng();
			routeCalc(pStart, pDestination);
		}, 100));

		routeCalc(pStart, pDestination);
	}
}

function init() {
	map=L.map('map');

	var mappos = L.Permalink.getMapLocation(12, [52.2,8.6]);
	map.setView(mappos.center, mappos.zoom);
	L.Permalink.setup(map);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);

	map.on('click', onMapClick);	

//	if (url("?rid")) {
//		$.getJSON("/cgi-bin/geojson" + location.search, function(data) {
//			lay=L.geoJson(data, {
//				style: featurestyle,
//				onEachFeature: oneachfeature,
//			});
//			lay.addTo(map);
//			map.fitBounds(lay.getBounds());
//		});
//	} else {
//		geojsonLayer = L.geoJson.ajax("", {
//			style: featurestyle,
//			onEachFeature: oneachfeature });
//
//		//map.on('zoomend', function() { refreshoverlay(map, geojsonLayer); });
//		//map.on('dragend', function() { refreshoverlay(map, geojsonLayer); });
//
//		map.addLayer(geojsonLayer);
//
//		refreshoverlay(map, geojsonLayer);
//	}
}
