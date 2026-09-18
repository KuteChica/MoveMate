const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json({ user: result.rows[0] });
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY id"
  );
  res.json({ users: result.rows });
});

router.patch("/me", protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email)
       WHERE id = $3
       RETURNING id, name, email, role, created_at`,
      [name || null, email ? email.trim().toLowerCase() : null, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "That email is already in use." });
    }
    console.error(error);
    res.status(500).json({ message: "Could not update profile." });
  }
});

router.post("/admin/create", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const allowed = ["student", "driver", "representative", "admin"];

    if (!name || !email || !password || !allowed.includes(role)) {
      return res.status(400).json({ message: "name, email, password and a valid role are required." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already exists." });
    }
    console.error(error);
    res.status(500).json({ message: "Could not create user." });
  }
});

module.exports = router;
