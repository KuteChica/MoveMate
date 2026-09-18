require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./database");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const shuttleRoutes = require("./routes/shuttles");
const routeRoutes = require("./routes/routeRoutes");
const locationRoutes = require("./routes/locations");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "MoveMate API is running.",
    version: "1.0.0"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");
    res.json({ connected: true, databaseTime: result.rows[0].time });
  } catch (error) {
    console.error(error);
    res.status(500).json({ connected: false, message: "Database connection failed." });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shuttles", shuttleRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/locations", locationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`MoveMate API running at http://localhost:${PORT}`);
});
