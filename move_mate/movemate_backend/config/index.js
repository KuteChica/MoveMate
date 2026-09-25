const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  database: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
    url: process.env.DATABASE_URL || `postgresql://${encodeURIComponent(process.env.DB_USER || "")}:${encodeURIComponent(process.env.DB_PASSWORD || "")}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || ""}`,
  },
  server: {
    port: Number(process.env.PORT || 5000),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  ai: {
    apiKey: process.env.AI_API_KEY || "",
    apiBaseUrl: process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
    model: process.env.AI_MODEL || "gpt-4o-mini",
  },
};