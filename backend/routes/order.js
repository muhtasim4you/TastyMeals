const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Settings = require("../models/Settings");
const User = require("../models/User");
const RewardTransaction = require("../models/RewardTransaction");
const auth = require("../middleware/auth");

const router = express.Router();

const POINT_VALUE = 0.5; // ৳ per reward point when redeemed
const POINTS_PER_RESCUED_UNIT = 10; // points earned per unit of a discounted/nearing-expiry item ordered

router.post("/", auth, async (req, res) => {
  try {
    const { payment, deliveryAddress, note, redeemPoints } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const user = await User.findById(req.user.id);

    let settings = await Settings.findOne();
    if (!settings) settings = { deliveryFee: 30, vatRate: 5 };

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = settings.deliveryFee;
    const tax = subtotal * (settings.vatRate / 100);
    const preDiscountTotal = subtotal + deliveryFee + tax;

    let pointsRedeemed = 0;
    let pointsDiscount = 0;
    const requestedPoints = Math.min(Math.max(0, redeemPoints || 0), user.rewardPoints);
    if (requestedPoints > 0) {
      const requestedValue = requestedPoints * POINT_VALUE;
      pointsDiscount = Math.min(requestedValue, preDiscountTotal);
      pointsRedeemed = Math.round(pointsDiscount / POINT_VALUE);
    }

    const total = preDiscountTotal - pointsDiscount;

    const rescuedUnits = cart.items.reduce(
      (sum, item) => sum + (item.isRescuedDeal ? item.quantity : 0),
      0
    );
    const pointsEarned = rescuedUnits * POINTS_PER_RESCUED_UNIT;

    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    const order = new Order({
      user: req.user.id,
      items: cart.items,
      subtotal,
      deliveryFee,
      tax,
      pointsDiscount,
      total,
      pointsEarned,
      pointsRedeemed,
      payment,
      deliveryAddress,
      note: note || "",
      status: "confirmed",
      estimatedDelivery,
      statusHistory: [
        { status: "confirmed", time: new Date(), message: "Order has been confirmed" },
      ],
    });

    await order.save();

    if (pointsRedeemed > 0) {
      user.rewardPoints -= pointsRedeemed;
      await RewardTransaction.create({
        user: user._id,
        points: -pointsRedeemed,
        type: "redeemed",
        reason: `Redeemed for ৳${pointsDiscount.toFixed(2)} off order`,
        order: order._id,
      });
    }

    if (pointsEarned > 0) {
      user.rewardPoints += pointsEarned;
      await RewardTransaction.create({
        user: user._id,
        points: pointsEarned,
        type: "earned",
        reason: `Ordered ${rescuedUnits} rescued item${rescuedUnits > 1 ? "s" : ""} nearing expiry`,
        order: order._id,
      });
    }

    if (pointsRedeemed > 0 || pointsEarned > 0) {
      await user.save();
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
