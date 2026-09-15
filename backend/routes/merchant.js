const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const merchant = require("../middleware/merchant");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Donation = require("../models/Donation");

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

    const { name, description, price, image, category, rating, discountPercentage, expiryDate } = req.body;
    restaurant.menu.push({
      name,
      description,
      price,
      image,
      category,
      rating: rating || 0,
      discountPercentage: discountPercentage || 0,
      expiryDate: expiryDate || null,
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

    const { name, description, price, image, category, rating, discountPercentage, expiryDate } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;
    if (rating !== undefined) item.rating = rating;
    if (discountPercentage !== undefined) item.discountPercentage = discountPercentage;
    if (expiryDate !== undefined) item.expiryDate = expiryDate || null;

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

module.exports = router;
