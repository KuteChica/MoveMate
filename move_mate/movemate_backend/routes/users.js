const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get the current user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Authentication required }
 */
router.get("/me", protect, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user.id) },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ user: user && { ...user, created_at: user.createdAt } });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User list }
 *       403: { description: Admin access required }
 */
router.get("/", protect, authorize("admin"), async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ users: users.map((user) => ({ ...user, created_at: user.createdAt })) });
});

/**
 * @swagger
 * /api/users/drivers:
 *   get:
 *     tags: [Admin]
 *     summary: List driver accounts for shuttle assignment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Driver accounts }
 *       403: { description: Admin access required }
 */
router.get("/drivers", protect, authorize("admin"), async (req, res) => {
  const drivers = await prisma.user.findMany({
    where: { role: "driver" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ drivers });
});

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update the current user's profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Profile updated }
 *       409: { description: Email already in use }
 */
router.patch("/me", protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email: email.trim().toLowerCase() } : {}),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({ user: { ...user, created_at: user.createdAt } });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "That email is already in use." });
    }
    console.error(error);
    res.status(500).json({ message: "Could not update profile." });
  }
});

/**
 * @swagger
 * /api/users/admin/create:
 *   post:
 *     tags: [Users]
 *     summary: Create a user with an assigned role
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [student, driver, representative, admin] }
 *     responses:
 *       201: { description: User created }
 *       403: { description: Admin access required }
 */
router.post("/admin/create", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const allowed = ["student", "driver", "representative", "admin"];

    if (!name || !email || !password || !allowed.includes(role)) {
      return res.status(400).json({ message: "name, email, password and a valid role are required." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json({ user: { ...user, created_at: user.createdAt } });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists." });
    }
    console.error(error);
    res.status(500).json({ message: "Could not create user." });
  }
});

module.exports = router;
