const express = require("express");
const auth = require("../middleware/auth");
const PromoCode = require("../models/PromoCode");
const validatePromo = require("../utils/validatePromo");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const promos = await PromoCode.find({
      active: true,
      visible: true,
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
    }).sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/validate", auth, async (req, res) => {
  try {
    const { code, subtotal, deliveryFee, tax } = req.body;
    if (!code) return res.status(400).json({ message: "Promo code is required" });

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (!promoCode) return res.status(404).json({ message: "Invalid promo code" });

    const preDiscountTotal = (subtotal || 0) + (deliveryFee || 0) + (tax || 0);
    const { discount } = await validatePromo(promoCode, req.user.id, subtotal || 0, preDiscountTotal);

    res.json({ code: promoCode.code, description: promoCode.description, discount });
  } catch (error) {
    res.status(400).json({ message: error.message || "Invalid promo code" });
  }
});

module.exports = router;
