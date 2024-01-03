
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

	./prepare guetersloh-latest.osm.pbf \
		profiles/osrm-default/car.lua \
		profiles/osrm-clampto30-zone-de-urban/car.lua

which will create 2 Docker volumes containing the different data.

Then run

	docker-compose -f compose.yaml up


Usage
=====

After starting the docker container point your Browser to

	http://localhost:8080

Click on the map for "Start" and "Endpoint". You'll see routes coming
up where the green one is result from OSRM A and red is from OSRM B

This is live calculated and you may move the marker around as you like.


finddiffs
=========

To brute force finding differences in routing use finddiffs

    ./finddiffs  --minx 8.12 --maxx 8.57 --maxy 52.12 --miny 51.72

It will randomly generated routes and print a link to to stdout
if the 2 routes differ by duration/distance.

For finding the bounding box of your data you may use `osmium`

    osmium fileinfo -e -g data.bbox nrw.pbf
    (5.843747,49.9247862,9.68153,52.7065863)

