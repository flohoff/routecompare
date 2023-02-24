function oneachfeature(feature, layer) {
	if (feature.properties && feature.properties.popupContent) {
		popupContent = feature.properties.popupContent;
		layer.bindPopup(popupContent);
	}
}

function featurestyle(feature) {
	console.log(feature.properties);
	return feature.properties.style;
}

function refreshoverlay(map, geojsonLayer) {
	var bbox=map.getBounds();

	var url="/cgi-bin/geojson?bbox="
		+ bbox.getWest() + "," 
		+ bbox.getNorth() + ","
		+ bbox.getEast() + ","
		+ bbox.getSouth() + ","
		+ map.getZoom();

	geojsonLayer.refresh(url);
}

function init() {
	var map=L.map('map');

	var mappos = L.Permalink.getMapLocation(12, [52.2,8.6]);
	map.setView(mappos.center, mappos.zoom);
	L.Permalink.setup(map);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	}).addTo(map);

	if (url("?rid")) {
		$.getJSON("/cgi-bin/geojson" + location.search, function(data) {
			lay=L.geoJson(data, {
				style: featurestyle,
				onEachFeature: oneachfeature,
			});
			lay.addTo(map);
			map.fitBounds(lay.getBounds());
		});
	} else {
		geojsonLayer = L.geoJson.ajax("", {
			style: featurestyle,
			onEachFeature: oneachfeature });

		map.on('zoomend', function() { refreshoverlay(map, geojsonLayer); });
		map.on('dragend', function() { refreshoverlay(map, geojsonLayer); });

		map.addLayer(geojsonLayer);

		refreshoverlay(map, geojsonLayer);
	}
}
