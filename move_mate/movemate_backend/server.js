const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./lib/swagger");
const prisma = require("./database");
const config = require("./config");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const shuttleRoutes = require("./routes/shuttles");
const routeRoutes = require("./routes/routeRoutes");
const locationRoutes = require("./routes/locations");
const notificationRoutes = require("./routes/notifications");
const feedbackRoutes = require("./routes/feedback");

const app = express();
const PORT = config.server.port;

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    message: "MoveMate API is running.",
    version: "1.0.0"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS time`;
    res.json({ connected: true, databaseTime: result[0].time });
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ message: "Something went wrong on the server." });
// });

app.listen(PORT, () => {
  console.log(`MoveMate API running at http://localhost:${PORT}`);
});
