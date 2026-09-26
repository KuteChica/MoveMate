-- Demo data for MoveMate.
-- Run after schema.sql.

INSERT INTO shuttle_routes (name, description, start_location, end_location)
SELECT 'Main Campus Route', 'Main campus shuttle route', 'Legon Hall', 'University of Ghana Main Gate'
WHERE NOT EXISTS (
  SELECT 1 FROM shuttle_routes WHERE name = 'Main Campus Route'
);

INSERT INTO stops (name, latitude, longitude)
SELECT * FROM (VALUES
  ('Legon Hall', 5.6508, -0.1869),
  ('University of Ghana Main Gate', 5.6502, -0.1876),
  ('Balme Library', 5.6519, -0.1871)
) AS v(name, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM stops WHERE stops.name = v.name);

INSERT INTO route_stops (route_id, stop_id, stop_order)
SELECT r.id, s.id, v.stop_order
FROM shuttle_routes r
JOIN (VALUES
  ('Legon Hall', 1),
  ('University of Ghana Main Gate', 2),
  ('Balme Library', 3)
) AS v(stop_name, stop_order) ON TRUE
JOIN stops s ON s.name = v.stop_name
WHERE r.name = 'Main Campus Route'
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs
    WHERE rs.route_id = r.id AND rs.stop_id = s.id
  );

UPDATE shuttles
SET name = 'Bani'
WHERE plate_number = 'MM-001' AND name = 'MoveMate Shuttle 1';

INSERT INTO shuttles (name, plate_number, status, current_route_id)
SELECT v.name, v.plate_number, 'inactive', r.id
FROM shuttle_routes r
CROSS JOIN (VALUES ('Bani', 'MM-001'), ('Evandi', 'MM-002'), ('TF', 'MM-003')) AS v(name, plate_number)
WHERE r.name = 'Main Campus Route'
  AND NOT EXISTS (SELECT 1 FROM shuttles WHERE shuttles.name = v.name);

-- The application can accept a driver's real GPS position through POST /api/locations.
-- These demo points give the AI assistant a real TF example to answer "Where is TF right now?".
INSERT INTO shuttle_locations (shuttle_id, latitude, longitude, place_name, speed_kmh)
SELECT s.id, 5.6508, -0.1869, 'Legon Hall', 20, NULL
FROM shuttles s
WHERE s.name = 'Bani'
  AND NOT EXISTS (
    SELECT 1 FROM shuttle_locations sl WHERE sl.shuttle_id = s.id
  );

INSERT INTO shuttle_locations (shuttle_id, latitude, longitude, place_name, speed_kmh)
SELECT s.id, 5.6519, -0.1871, 'Balme Library', 22, NULL
FROM shuttles s
WHERE s.name = 'TF'
  AND NOT EXISTS (
    SELECT 1 FROM shuttle_locations sl WHERE sl.shuttle_id = s.id
  );
