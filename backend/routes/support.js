const express = require("express");
const auth = require("../middleware/auth");
const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { subject, message, channel } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const ticket = new SupportTicket({
      user: req.user.id,
      subject,
      channel: channel || "chat",
      messages: [{ sender: "user", senderName: user.name, message }],
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/messages", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status === "closed") {
      return res.status(400).json({ message: "This ticket is closed" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    ticket.messages.push({ sender: "user", senderName: user.name, message });
    if (ticket.status === "resolved") ticket.status = "open";
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
