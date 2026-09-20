const express = require("express");
const prisma = require("../database");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject and message are required." });
    }
    await prisma.feedback.create({ data: { name, email, subject, message } });
    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit feedback." });
  }
});

module.exports = router;