-- Buffer intersection over known service-line geometries.
-- Inverse-distance weighting and plume estimation are intentionally absent:
-- LangGraph workers must not invent contamination between USGS stations.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS service_lines (
    id text PRIMARY KEY,
    material text NOT NULL CHECK (material IN ('lead', 'copper', 'unknown')),
    geom geometry(Point, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS service_lines_geom_gix ON service_lines USING gist (geom);

CREATE OR REPLACE FUNCTION service_lines_within(
    lat double precision,
    lon double precision,
    buffer_m double precision
)
RETURNS TABLE(id text, material text, distance_m double precision)
LANGUAGE sql
STABLE
AS $$
    SELECT
        s.id,
        s.material,
        ST_Distance(
            s.geom::geography,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) AS distance_m
    FROM service_lines AS s
    WHERE ST_DWithin(
        s.geom::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        buffer_m
    );
$$;

COMMENT ON FUNCTION service_lines_within IS
    'Known-geometry buffer only. Do not estimate unsampled plumes.';
