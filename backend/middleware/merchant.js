const User = require("../models/User");

const merchant = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "merchant") {
      return res.status(403).json({ message: "Access denied. Merchant only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = merchant;
