const express = require("express");
const Wishlist = require("../models/Wishlist");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, restaurants: [], items: [] });
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/restaurant", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, restaurants: [], items: [] });
    }

    const { restaurantId, name, cuisine, rating, location, image } = req.body;
    const exists = wishlist.restaurants.find((r) => r.restaurantId === restaurantId);

    if (exists) {
      wishlist.restaurants = wishlist.restaurants.filter(
        (r) => r.restaurantId !== restaurantId
      );
    } else {
      wishlist.restaurants.push({ restaurantId, name, cuisine, rating, location, image });
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/item", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, restaurants: [], items: [] });
    }

    const { name, restaurant, price, image } = req.body;
    const exists = wishlist.items.find(
      (i) => i.name === name && i.restaurant === restaurant
    );

    if (exists) {
      wishlist.items = wishlist.items.filter(
        (i) => !(i.name === name && i.restaurant === restaurant)
      );
    } else {
      wishlist.items.push({ name, restaurant, price, image });
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/restaurant/:restaurantId", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.restaurants = wishlist.restaurants.filter(
      (r) => r.restaurantId !== req.params.restaurantId
    );
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/item/:itemId", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (i) => i._id.toString() !== req.params.itemId
    );
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
