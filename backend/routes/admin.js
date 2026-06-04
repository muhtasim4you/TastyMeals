const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const Settings = require("../models/Settings");

const router = express.Router();

// ===== DASHBOARD STATS =====
router.get("/stats", auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = await Order.countDocuments({ status: { $nin: ["delivered", "cancelled"] } });

    res.json({ totalUsers, totalRestaurants, totalOrders, totalRevenue, pendingOrders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== USER MANAGEMENT =====
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== RESTAURANT MANAGEMENT =====
router.get("/restaurants", auth, admin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/restaurants", auth, admin, async (req, res) => {
  try {
    const { name, cuisine, rating, location, image, description } = req.body;
    const restaurant = new Restaurant({ name, cuisine, rating, location, image, description, menu: [] });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/restaurants/:id", auth, admin, async (req, res) => {
  try {
    const { name, cuisine, rating, location, image, description } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, cuisine, rating, location, image, description },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/restaurants/:id", auth, admin, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== MENU ITEM MANAGEMENT =====
router.post("/restaurants/:id/menu", auth, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const { name, description, price, image, category, rating } = req.body;
    restaurant.menu.push({ name, description, price, image, category, rating: rating || 0 });
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/restaurants/:id/menu/:itemId", auth, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const { name, description, price, image, category, rating } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;
    if (rating !== undefined) item.rating = rating;

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/restaurants/:id/menu/:itemId", auth, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    restaurant.menu = restaurant.menu.filter((item) => item._id.toString() !== req.params.itemId);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== ORDER MANAGEMENT =====
router.get("/orders", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/orders/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const messages = {
      pending: "Order is pending",
      confirmed: "Order has been confirmed",
      preparing: "Restaurant is preparing your food",
      on_the_way: "Your order is on the way",
      delivered: "Order has been delivered",
      cancelled: "Order has been cancelled",
    };

    order.status = status;
    order.statusHistory.push({
      status,
      time: new Date(),
      message: messages[status],
    });

    await order.save();
    const populated = await Order.findById(order._id).populate("user", "name email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== SETTINGS MANAGEMENT =====
router.get("/settings", auth, admin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ deliveryFee: 30, vatRate: 5 });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/settings", auth, admin, async (req, res) => {
  try {
    const { deliveryFee, vatRate } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
    if (vatRate !== undefined) settings.vatRate = vatRate;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
