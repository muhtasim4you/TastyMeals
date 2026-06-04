const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Settings = require("../models/Settings");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { payment, deliveryAddress, note } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let settings = await Settings.findOne();
    if (!settings) settings = { deliveryFee: 30, vatRate: 5 };

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = settings.deliveryFee;
    const tax = subtotal * (settings.vatRate / 100);
    const total = subtotal + deliveryFee + tax;

    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    const order = new Order({
      user: req.user.id,
      items: cart.items,
      subtotal,
      deliveryFee,
      tax,
      total,
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
