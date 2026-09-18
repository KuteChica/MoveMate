const express = require("express");
const pool = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("driver", "admin"), async (req, res) => {
  try {
    const { shuttle_id, latitude, longitude, place_name = null, speed_kmh = null } = req.body;

    if (!shuttle_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "shuttle_id, latitude and longitude are required."
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ message: "Invalid GPS coordinates." });
    }

    const shuttle = await pool.query("SELECT id FROM shuttles WHERE id = $1", [shuttle_id]);
    if (shuttle.rowCount === 0) {
      return res.status(404).json({ message: "Shuttle not found." });
    }

    const result = await pool.query(
      `INSERT INTO shuttle_locations
       (shuttle_id, latitude, longitude, place_name, speed_kmh)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [shuttle_id, lat, lon, place_name, speed_kmh === null ? null : Number(speed_kmh)]
    );

    await pool.query(
      "UPDATE shuttles SET updated_at = NOW(), status = 'active' WHERE id = $1",
      [shuttle_id]
    );

    res.status(201).json({
      message: "Location recorded.",
      location: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save shuttle location." });
  }
});

router.get("/:shuttleId/history", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, latitude, longitude, place_name, speed_kmh, recorded_at
       FROM shuttle_locations
       WHERE shuttle_id = $1
       ORDER BY recorded_at DESC
       LIMIT 100`,
      [req.params.shuttleId]
    );

    res.json({ locations: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load location history." });
  }
});

module.exports = router;
