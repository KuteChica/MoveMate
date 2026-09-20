const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "MoveMate API",
      version: "1.0.0",
      description: "API for campus shuttle tracking, routes, users, and GPS locations."
    },
    servers: [
      {
        url: "/",
        description: "Current MoveMate API server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Student" },
            email: { type: "string", format: "email", example: "student@example.com" },
            role: { type: "string", enum: ["student", "driver", "representative", "admin"] },
            created_at: { type: "string", format: "date-time" }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
            token: { type: "string" }
          }
        },
        Error: {
          type: "object",
          properties: { message: { type: "string" } }
        }
      }
    }
  },
  apis: [path.join(__dirname, "../routes/*.js").replaceAll("\\", "/")]
};

module.exports = swaggerJSDoc(options);