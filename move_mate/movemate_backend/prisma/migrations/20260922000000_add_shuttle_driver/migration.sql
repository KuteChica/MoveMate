ALTER TABLE shuttles
  ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(30);

ALTER TABLE shuttle_locations
  ADD COLUMN IF NOT EXISTS accuracy_meters DOUBLE PRECISION;

CREATE UNIQUE INDEX IF NOT EXISTS shuttles_driver_id_key ON shuttles(driver_id) WHERE driver_id IS NOT NULL;