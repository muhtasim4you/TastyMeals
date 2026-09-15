const express = require("express");
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    const withReadFlag = notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      image: n.image,
      createdAt: n.createdAt,
      read: n.readBy.some((id) => id.toString() === req.user.id),
    }));
    res.json(withReadFlag);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (!notification.readBy.some((id) => id.toString() === req.user.id)) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/read-all", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ readBy: { $ne: req.user.id } });
    await Promise.all(
      notifications.map((n) => {
        n.readBy.push(req.user.id);
        return n.save();
      })
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
