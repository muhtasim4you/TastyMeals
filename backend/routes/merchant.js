const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const merchant = require("../middleware/merchant");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Donation = require("../models/Donation");
const WastageLog = require("../models/WastageLog");
const JobPosting = require("../models/JobPosting");
const JobApplication = require("../models/JobApplication");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      name, email, password,
      restaurantName, cuisine, location, image, description,
    } = req.body;

    if (!restaurantName || !cuisine || !location) {
      return res.status(400).json({ message: "Restaurant name, cuisine, and location are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role: "merchant" });
    await user.save();

    const restaurant = new Restaurant({
      name: restaurantName,
      cuisine,
      location,
      image: image || "",
      description: description || "",
      owner: user._id,
      menu: [],
    });
    await restaurant.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/restaurant", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/restaurant", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const { name, cuisine, location, image, description } = req.body;
    if (name !== undefined) restaurant.name = name;
    if (cuisine !== undefined) restaurant.cuisine = cuisine;
    if (location !== undefined) restaurant.location = location;
    if (image !== undefined) restaurant.image = image;
    if (description !== undefined) restaurant.description = description;

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/restaurant/menu", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

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

router.put("/restaurant/menu/:itemId", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

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

router.delete("/restaurant/menu/:itemId", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    restaurant.menu = restaurant.menu.filter((item) => item._id.toString() !== req.params.itemId);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/donations", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const donations = await Donation.find({ restaurant: restaurant._id })
      .populate("charity", "name location")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/donations", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const { charityId, foodItem, quantity, unit, notes } = req.body;
    if (!charityId || !foodItem || !quantity) {
      return res.status(400).json({ message: "Charity, food item, and quantity are required" });
    }

    const donation = new Donation({
      restaurant: restaurant._id,
      charity: charityId,
      foodItem,
      quantity,
      unit: unit || "portions",
      notes: notes || "",
    });
    await donation.save();
    const populated = await Donation.findById(donation._id).populate("charity", "name location");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/donations/:id/cancel", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const donation = await Donation.findOne({ _id: req.params.id, restaurant: restaurant._id });
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "pending") {
      return res.status(400).json({ message: "Only pending donations can be cancelled" });
    }

    donation.status = "cancelled";
    await donation.save();
    const populated = await Donation.findById(donation._id).populate("charity", "name location");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

const WASTAGE_REASONS = ["unsold", "spoiled", "overproduction", "quality_issue", "other"];

router.get("/wastage/analytics", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const logs = await WastageLog.find({ restaurant: restaurant._id });
    const donations = await Donation.find({ restaurant: restaurant._id, status: "picked_up" });

    const totalQuantity = logs.reduce((sum, l) => sum + l.quantity, 0);
    const totalValue = logs.reduce((sum, l) => sum + l.estimatedValue, 0);

    const byReason = WASTAGE_REASONS.map((reason) => {
      const matching = logs.filter((l) => l.reason === reason);
      return {
        reason,
        quantity: matching.reduce((sum, l) => sum + l.quantity, 0),
        value: matching.reduce((sum, l) => sum + l.estimatedValue, 0),
      };
    });

    const itemTotals = {};
    logs.forEach((l) => {
      if (!itemTotals[l.itemName]) itemTotals[l.itemName] = { itemName: l.itemName, quantity: 0, value: 0 };
      itemTotals[l.itemName].quantity += l.quantity;
      itemTotals[l.itemName].value += l.estimatedValue;
    });
    const topItems = Object.values(itemTotals)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const rescuedQuantity = donations.reduce((sum, d) => sum + d.quantity, 0);
    const denominator = rescuedQuantity + totalQuantity;
    const diversionRate = denominator > 0 ? Math.round((rescuedQuantity / denominator) * 100) : 0;

    res.json({
      totalQuantity,
      totalValue,
      byReason,
      topItems,
      rescuedQuantity,
      diversionRate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/wastage", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const logs = await WastageLog.find({ restaurant: restaurant._id }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/wastage", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const { itemName, category, quantity, unit, reason, estimatedValue, date, notes } = req.body;
    if (!itemName || !quantity) {
      return res.status(400).json({ message: "Item name and quantity are required" });
    }

    const log = new WastageLog({
      restaurant: restaurant._id,
      itemName,
      category: category || "Main",
      quantity,
      unit: unit || "portions",
      reason: reason || "unsold",
      estimatedValue: estimatedValue || 0,
      date: date || Date.now(),
      notes: notes || "",
    });
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/wastage/:id", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const log = await WastageLog.findOneAndDelete({ _id: req.params.id, restaurant: restaurant._id });
    if (!log) return res.status(404).json({ message: "Wastage log not found" });
    res.json({ message: "Wastage log deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/jobs", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const jobs = await JobPosting.find({ restaurant: restaurant._id }).sort({ createdAt: -1 });
    const jobIds = jobs.map((j) => j._id);
    const counts = await JobApplication.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    res.json(jobs.map((j) => ({ ...j.toObject(), applicantCount: countMap[j._id.toString()] || 0 })));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/jobs", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const { title, description, location, employmentType, salaryRange } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ message: "Title, description, and location are required" });
    }

    const job = new JobPosting({
      restaurant: restaurant._id,
      title,
      description,
      location,
      employmentType: employmentType || "full_time",
      salaryRange: salaryRange || "",
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/jobs/:id", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const job = await JobPosting.findOne({ _id: req.params.id, restaurant: restaurant._id });
    if (!job) return res.status(404).json({ message: "Job posting not found" });

    const { title, description, location, employmentType, salaryRange, status } = req.body;
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (location !== undefined) job.location = location;
    if (employmentType !== undefined) job.employmentType = employmentType;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;
    if (status !== undefined) job.status = status;

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/jobs/:id", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const job = await JobPosting.findOneAndDelete({ _id: req.params.id, restaurant: restaurant._id });
    if (!job) return res.status(404).json({ message: "Job posting not found" });
    await JobApplication.deleteMany({ job: job._id });
    res.json({ message: "Job posting deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/jobs/:id/applications", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const job = await JobPosting.findOne({ _id: req.params.id, restaurant: restaurant._id });
    if (!job) return res.status(404).json({ message: "Job posting not found" });

    const applications = await JobApplication.find({ job: job._id }).sort({ createdAt: -1 });
    res.json({ job, applications });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/applications/:id/status", auth, merchant, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "No restaurant found for this account" });

    const validStatuses = ["submitted", "reviewed", "shortlisted", "rejected", "hired"];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await JobApplication.findById(req.params.id).populate("job");
    if (!application || application.job.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
