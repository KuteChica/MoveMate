const express = require("express");
const nodemailer = require("nodemailer");
const prisma = require("../database");
const config = require("../config");

const router = express.Router();

async function sendFeedbackEmail({ name, email, subject, message }) {
  if (!config.email.user || !config.email.pass) {
    console.warn("Feedback email skipped: SMTP credentials are not configured.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  await transporter.sendMail({
    from: config.email.from,
    to: config.email.to,
    replyTo: email,
    subject: `[MoveMate Feedback] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });
}

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Name, email, subject and message are required." });
    }

    const createdFeedback = await prisma.feedback.create({
      data: { name, email, subject, message },
    });

    try {
      await sendFeedbackEmail({ name, email, subject, message });
    } catch (emailError) {
      console.error("Feedback email delivery failed:", emailError);
    }

    res.status(201).json({
      message: "Feedback submitted successfully.",
      feedbackId: createdFeedback.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit feedback." });
  }
});

module.exports = router;