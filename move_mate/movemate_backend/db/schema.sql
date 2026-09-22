-- MoveMate database migration.
-- Run this once against the mydb database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Existing users table is extended rather than replaced.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'student';

-- Application tables
CREATE TABLE IF NOT EXISTS shuttle_routes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  start_location VARCHAR(150),
  end_location VARCHAR(150),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_stops (
  route_id INTEGER NOT NULL REFERENCES shuttle_routes(id) ON DELETE CASCADE,
  stop_id INTEGER NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  PRIMARY KEY (route_id, stop_id),
  UNIQUE (route_id, stop_order)
);

CREATE TABLE IF NOT EXISTS shuttles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  plate_number VARCHAR(50) UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'inactive',
  current_route_id INTEGER REFERENCES shuttle_routes(id) ON DELETE SET NULL,
  driver_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  driver_phone VARCHAR(30),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shuttle_locations (
  id BIGSERIAL PRIMARY KEY,
  shuttle_id INTEGER NOT NULL REFERENCES shuttles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  place_name VARCHAR(200),
  speed_kmh DOUBLE PRECISION,
  accuracy_meters DOUBLE PRECISION,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shuttle_locations_shuttle_time
  ON shuttle_locations (shuttle_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  shuttle_id INTEGER NOT NULL REFERENCES shuttles(id) ON DELETE CASCADE,
  route_id INTEGER REFERENCES shuttle_routes(id) ON DELETE SET NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Helpful validation
ALTER TABLE shuttles
  DROP CONSTRAINT IF EXISTS shuttles_status_check;

ALTER TABLE shuttles
  ADD CONSTRAINT shuttles_status_check
  CHECK (status IN ('active', 'inactive', 'maintenance'));

ALTER TABLE trips
  DROP CONSTRAINT IF EXISTS trips_status_check;

ALTER TABLE trips
  ADD CONSTRAINT trips_status_check
  CHECK (status IN ('active', 'completed', 'cancelled'));
