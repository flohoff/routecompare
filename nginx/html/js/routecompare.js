var map;
var popup = L.popup();

var mStart;
var pStart;
var mDestination;
var pDestination;

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
		style: style
	}).addTo(map);
}

function sendRemoteEditCommand(url, callback) {
	var iframe = $("<iframe>");
	var timeoutId = setTimeout(function () {
		iframe.remove();
	}, 5000);

	iframe
		.hide()
		.appendTo("body")
		.attr("src", url)
		.on("load", function () {
			clearTimeout(timeoutId);
			iframe.remove();
			if (callback) callback();
		});
}

function remoteEdit() {
	var bbox=map.getBounds();
	var remoteEditHost = "http://127.0.0.1:8111";
	var query = {
		left: bbox.getWest() - 0.0001,
		top: bbox.getNorth() + 0.0001,
		right: bbox.getEast() + 0.0001,
		bottom: bbox.getSouth() - 0.0001
	};

	sendRemoteEditCommand(remoteEditHost + "/load_and_zoom?" + $.param(query));
}

var layerA;
var layerB;

function routeinfo(data, where) {

	route=data.routes[0];

	$(where).html("Duration <b>" + route.duration + "</b>" + " Weight <b>" + route.weight + "</b>");
}

function routeCalc(s, e, zoomtoroute) {
	if (!s || !e) {
		return;
	}

	$.getJSON("/osrma/route/v1/car/" + s.lng + "," + s.lat + ";" + e.lng + "," + e.lat + "?geometries=geojson&overview=full&annotations=true&steps=true&alternatives=true", function(data) {
		if (layerA) {
			map.removeLayer(layerA);
		}
		layerA=routeAdd(data, styleA);
		routeinfo(data, "#rinfoa");
	});

	$.getJSON("/osrmb/route/v1/car/" + s.lng + "," + s.lat + ";" + e.lng + "," + e.lat + "?geometries=geojson&overview=full&annotations=true&steps=true&alternatives=true", function(data) {
		if (layerB) {
			map.removeLayer(layerB);
		}
		layerB=routeAdd(data, styleB);
		routeinfo(data, "#rinfob");

		if (zoomtoroute) {
			map.fitBounds(layerB.getBounds());
		}
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

		routeCalc(pStart, pDestination, 0);
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

        if (url("?route")) {
                const re = /route=([^,]*),([^,]*),([^,]*),([^,]*)/;
                const match=re.exec(location.search);

		var s={
			lng: match[1],
			lat: match[2]
		};
		var e={
			lng: match[3],
			lat: match[4]
		};

		routeCalc(s,e, 1);
	}
}
