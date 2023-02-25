
The purpose of this repository is to visualize planned maxspeed and other
road changes with their consequences on routing/navigation and thus on 
traffic volume.

For this 2 OSRM instances will be started with original and modified 
data. For the modification the 2 OSRM Profile directories will be used

The current **osrmBprofiles* containes modifications to cap maxspeed to 30
in case of

	maxspeed:type=DE:urban

or

	zone:traffic=DE:urban


Installation
============

Fetch yourself an PBF file of OSM data an run "prepare" 

	./preprocess guetersloh-latest.osm.pbf \
		profiles/osrm-default \
		profiles/osrm-clampto30-zone-de-urban

which will create 2 Docker volumes containing the different data.

Then run

	docker-compose -f compose.yml up


Usage
=====

After starting the docker container point your Browser to

	http://localhost:8080

Click on the map for "Start" and "Endpoint". You'll see routes coming
up where the green one is result from OSRM A and red is from OSRM B

This is live calculated and you may move the marker around as you like.
