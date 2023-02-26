select  distinct ST_AsText(geom)
from    (
        select  (ST_DumpPoints(way)).*
        from    planet_osm_line
        where   highway in ( 'residential', 'unclassified', 'tertiary', 'primary', 'secondary' )
        ) p;
