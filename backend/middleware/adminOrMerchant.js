const User = require("../models/User");

const adminOrMerchant = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== "admin" && user.role !== "merchant")) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminOrMerchant;
