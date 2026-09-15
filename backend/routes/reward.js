const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const RewardTransaction = require("../models/RewardTransaction");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("rewardPoints");
    const transactions = await RewardTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ balance: user.rewardPoints, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
