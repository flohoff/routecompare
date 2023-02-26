drop table if exists routesjson;
create table routesjson ( j jsonb );
\copy routesjson from '/data/output/routes' csv quote e'\x01' delimiter e'\x02'

drop table if exists routes;
select	ST_SetSRID(ST_Geomfromgeojson(j),4326) as geom,
	j->'properties'->>'instance' as instance,
	j
into	routes
from	routesjson;

analyze routes;

drop table if exists hexagon;
select	ST_Transform(hexes.geom,4326) geom,
	0::integer old,
	0::integer new,
	0::integer delta,
	0::float perc
into    hexagon
from    ST_HexagonGrid(
                100,
                ST_Transform(ST_SetSRID(ST_EstimatedExtent('routes', 'geom'),4326), 3857)
        ) as hexes;
alter table hexagon add column id serial not null primary key;


update hexagon
set     old=oldintersects.oldc
from (
                select  count(*) oldc,hexagon.id
                from    hexagon left outer join routes on ( routes.instance = 'osrma' and ST_Intersects(routes.geom,hexagon.geom) )
                group by hexagon.id
        ) oldintersects
where   hexagon.id=oldintersects.id;

update hexagon
set     new=newintersects.newc
from (
                select  count(*) newc,hexagon.id
                from    hexagon left outer join routes on ( routes.instance = 'osrmb' and ST_Intersects(routes.geom,hexagon.geom) )
                group by hexagon.id
        ) newintersects
where   hexagon.id=newintersects.id;

update hexagon
	set	delta=new-old;

update hexagon
	set	perc=old::float/delta::float*100
where delta > 0;

delete from hexagon where old = 1 and new = 1;
