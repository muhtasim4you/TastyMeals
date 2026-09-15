const express = require("express");
const Charity = require("../models/Charity");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const charities = await Charity.find().sort({ name: 1 });
    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
