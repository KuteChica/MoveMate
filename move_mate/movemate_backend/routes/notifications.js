const express = require("express");
const prisma = require("../database");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(req.user.id) },
      orderBy: { createdAt: "desc" },
    });
    res.json({ notifications: notifications.map((notification) => ({
      ...notification,
      user_id: notification.userId,
      created_at: notification.createdAt,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load notifications." });
  }
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    if (!user_id || !title || !message) {
      return res.status(400).json({ message: "user_id, title and message are required." });
    }
    const notification = await prisma.notification.create({
      data: { userId: Number(user_id), title, message },
    });
    res.status(201).json({ notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create notification." });
  }
});

module.exports = router;