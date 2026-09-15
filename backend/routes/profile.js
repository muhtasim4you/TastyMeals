const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const { name, phone, address, payment, dietary } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (payment) {
      const paymentUpdate = { cardName: payment.cardName || "", expiry: payment.expiry || "" };
      const digitsOnly = (payment.cardNumber || "").replace(/\D/g, "");
      if (digitsOnly.length >= 4) {
        paymentUpdate.cardNumber = `**** **** **** ${digitsOnly.slice(-4)}`;
      }
      // CVV is intentionally never persisted.
      updateFields.payment = paymentUpdate;
    }
    if (dietary) {
      // Merge field-by-field so this doesn't wipe out diet-plan health
      // metrics (age/weight/height/goal) that live in the same subdocument
      // but aren't part of the Profile page's dietary form.
      Object.keys(dietary).forEach((key) => {
        updateFields[`dietary.${key}`] = dietary[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
