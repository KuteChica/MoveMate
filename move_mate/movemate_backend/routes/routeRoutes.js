const express = require("express");
const pool = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const routes = await pool.query(`
      SELECT id, name, description, start_location, end_location, active
      FROM shuttle_routes
      ORDER BY id
    `);

    res.json({ routes: routes.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load routes." });
  }
});

router.get("/:id/stops", protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rs.stop_order, s.id, s.name, s.latitude, s.longitude
      FROM route_stops rs
      JOIN stops s ON s.id = rs.stop_id
      WHERE rs.route_id = $1
      ORDER BY rs.stop_order
    `, [req.params.id]);

    res.json({ stops: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load route stops." });
  }
});

router.post("/", protect, authorize("admin", "representative"), async (req, res) => {
  try {
    const { name, description, start_location, end_location } = req.body;

    if (!name) return res.status(400).json({ message: "Route name is required." });

    const result = await pool.query(
      `INSERT INTO shuttle_routes (name, description, start_location, end_location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, start_location || null, end_location || null]
    );

    res.status(201).json({ route: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create route." });
  }
});

module.exports = router;
