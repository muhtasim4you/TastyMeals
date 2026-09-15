const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const Settings = require("../models/Settings");
const Charity = require("../models/Charity");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const WastageLog = require("../models/WastageLog");
const JobPosting = require("../models/JobPosting");
const JobApplication = require("../models/JobApplication");
const Review = require("../models/Review");
const SupportTicket = require("../models/SupportTicket");
const PromoCode = require("../models/PromoCode");

const router = express.Router();

// ===== DASHBOARD STATS =====
router.get("/stats", auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
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
    const restaurants = await Restaurant.find({ owner: { $ne: null } }).select("name owner");
    const ownerToRestaurant = {};
    restaurants.forEach((r) => {
      ownerToRestaurant[r.owner.toString()] = { id: r._id, name: r.name };
    });

    const usersWithRestaurant = users.map((u) => ({
      ...u.toObject(),
      restaurant: u.role === "merchant" ? ownerToRestaurant[u._id.toString()] || null : undefined,
    }));

    res.json(usersWithRestaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin" });
    if (user.role === "merchant") {
      const ownedRestaurant = await Restaurant.findOne({ owner: req.params.id });
      if (ownedRestaurant) {
        return res.status(400).json({ message: "Cannot delete a merchant who still owns a restaurant. Delete or reassign the restaurant first." });
      }
    }
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
    const activeDonation = await Donation.findOne({
      restaurant: req.params.id,
      status: { $in: ["pending", "accepted"] },
    });
    if (activeDonation) {
      return res.status(400).json({ message: "Cannot delete a restaurant with an active donation in progress" });
    }
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

    const { name, description, price, image, category, rating, discountPercentage, expiryDate, calories, protein, carbs, fat } = req.body;
    restaurant.menu.push({
      name,
      description,
      price,
      image,
      category,
      rating: rating || 0,
      discountPercentage: discountPercentage || 0,
      expiryDate: expiryDate || null,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
    });
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

    const { name, description, price, image, category, rating, discountPercentage, expiryDate, calories, protein, carbs, fat } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;
    if (rating !== undefined) item.rating = rating;
    if (discountPercentage !== undefined) item.discountPercentage = discountPercentage;
    if (expiryDate !== undefined) item.expiryDate = expiryDate || null;
    if (calories !== undefined) item.calories = calories;
    if (protein !== undefined) item.protein = protein;
    if (carbs !== undefined) item.carbs = carbs;
    if (fat !== undefined) item.fat = fat;

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

// ===== CHARITY PARTNER MANAGEMENT =====
router.get("/charities", auth, admin, async (req, res) => {
  try {
    const charities = await Charity.find().sort({ createdAt: -1 });
    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/charities", auth, admin, async (req, res) => {
  try {
    const { name, description, location, contactPhone, contactEmail, image } = req.body;
    const charity = new Charity({ name, description, location, contactPhone, contactEmail, image });
    await charity.save();

    await Notification.create({
      title: "New Charity Partner Onboard",
      message: `TastyMeals has partnered with ${charity.name} to help redirect surplus food to those in need.`,
      type: "initiative",
      image: charity.image,
    });

    res.status(201).json(charity);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/charities/:id", auth, admin, async (req, res) => {
  try {
    const { name, description, location, contactPhone, contactEmail, image } = req.body;
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      { name, description, location, contactPhone, contactEmail, image },
      { new: true }
    );
    if (!charity) return res.status(404).json({ message: "Charity not found" });
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/charities/:id", auth, admin, async (req, res) => {
  try {
    const activeDonation = await Donation.findOne({
      charity: req.params.id,
      status: { $in: ["pending", "accepted"] },
    });
    if (activeDonation) {
      return res.status(400).json({ message: "Cannot delete a charity with an active donation in progress" });
    }
    await Charity.findByIdAndDelete(req.params.id);
    res.json({ message: "Charity deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== DONATION MANAGEMENT =====
router.get("/donations", auth, admin, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("restaurant", "name location")
      .populate("charity", "name location")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/donations/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "picked_up", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("restaurant", "name location")
      .populate("charity", "name location");
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (status === "picked_up" && donation.restaurant && donation.charity) {
      await Notification.create({
        title: "Surplus Food Rescued",
        message: `${donation.restaurant.name} donated ${donation.quantity} ${donation.unit} of ${donation.foodItem} to ${donation.charity.name}, reducing food waste in the community.`,
        type: "donation_impact",
      });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== NOTIFICATION MANAGEMENT =====
router.get("/notifications", auth, admin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/notifications", auth, admin, async (req, res) => {
  try {
    const { title, message, type, image } = req.body;
    const notification = new Notification({ title, message, type: type || "initiative", image });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/notifications/:id", auth, admin, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== FOOD WASTAGE OVERSIGHT (read-only) =====
router.get("/wastage", auth, admin, async (req, res) => {
  try {
    const logs = await WastageLog.find()
      .populate("restaurant", "name location")
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== JOB POSTING OVERSIGHT =====
router.get("/jobs", auth, admin, async (req, res) => {
  try {
    const jobs = await JobPosting.find().populate("restaurant", "name location").sort({ createdAt: -1 });
    const counts = await JobApplication.aggregate([
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    res.json(jobs.map((j) => ({ ...j.toObject(), applicantCount: countMap[j._id.toString()] || 0 })));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/jobs/:id", auth, admin, async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job posting not found" });
    await JobApplication.deleteMany({ job: job._id });
    res.json({ message: "Job posting removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== REVIEW OVERSIGHT =====
router.get("/reviews", auth, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("restaurant", "name location")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/reviews/:id", auth, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const remaining = await Review.find({ restaurant: review.restaurant });
    const avg =
      remaining.length > 0
        ? remaining.reduce((sum, r) => sum + r.restaurantRating, 0) / remaining.length
        : 0;
    await Restaurant.findByIdAndUpdate(review.restaurant, { rating: Math.round(avg * 10) / 10 });

    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== SUPPORT TICKET MANAGEMENT =====
router.get("/support", auth, admin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/support/:id", auth, admin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate("user", "name email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/support/:id/messages", auth, admin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const admin_ = await User.findById(req.user.id);
    if (!admin_) return res.status(404).json({ message: "Admin user not found" });
    ticket.messages.push({ sender: "support", senderName: admin_.name, message });
    if (ticket.status === "open") ticket.status = "in_progress";
    await ticket.save();

    const populated = await SupportTicket.findById(ticket._id).populate("user", "name email");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/support/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("user", "name email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== PROMO CODE MANAGEMENT =====
router.get("/promos", auth, admin, async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/promos", auth, admin, async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue, maxDiscount,
      minOrderValue, expiryDate, usageLimit, usageLimitPerUser, visible, active,
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ message: "Code and discount value are required" });
    }

    const existing = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (existing) return res.status(400).json({ message: "A promo code with this code already exists" });

    const promo = new PromoCode({
      code: code.toUpperCase().trim(),
      description: description || "",
      discountType: discountType || "percentage",
      discountValue,
      maxDiscount: maxDiscount || null,
      minOrderValue: minOrderValue || 0,
      expiryDate: expiryDate || null,
      usageLimit: usageLimit || null,
      usageLimitPerUser: usageLimitPerUser || 1,
      visible: visible !== undefined ? visible : true,
      active: active !== undefined ? active : true,
    });
    await promo.save();

    const discountText =
      promo.discountType === "percentage" ? `${promo.discountValue}% off` : `৳${promo.discountValue} off`;
    await Notification.create({
      title: `New Promo Code: ${promo.code}`,
      message: `${discountText}${promo.description ? " — " + promo.description : ""}. Use code ${promo.code} at checkout!`,
      type: "promo",
    });

    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/promos/:id", auth, admin, async (req, res) => {
  try {
    const {
      description, discountType, discountValue, maxDiscount,
      minOrderValue, expiryDate, usageLimit, usageLimitPerUser, active, visible,
    } = req.body;

    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: "Promo code not found" });

    if (description !== undefined) promo.description = description;
    if (discountType !== undefined) promo.discountType = discountType;
    if (discountValue !== undefined) promo.discountValue = discountValue;
    if (maxDiscount !== undefined) promo.maxDiscount = maxDiscount || null;
    if (minOrderValue !== undefined) promo.minOrderValue = minOrderValue;
    if (expiryDate !== undefined) promo.expiryDate = expiryDate || null;
    if (usageLimit !== undefined) promo.usageLimit = usageLimit || null;
    if (usageLimitPerUser !== undefined) promo.usageLimitPerUser = usageLimitPerUser;
    if (active !== undefined) promo.active = active;
    if (visible !== undefined) promo.visible = visible;

    await promo.save();
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/promos/:id", auth, admin, async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: "Promo code deleted" });
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
