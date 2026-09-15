const express = require("express");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select("-menu");
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.json({ restaurants: [], items: [] });
    }

    const regex = new RegExp(q, "i");

    const restaurants = await Restaurant.find({
      $or: [
        { name: regex },
        { cuisine: regex },
        { location: regex },
      ],
    }).select("-menu");

    const allRestaurants = await Restaurant.find({
      "menu.name": regex,
    });

    const items = [];
    allRestaurants.forEach((restaurant) => {
      restaurant.menu.forEach((item) => {
        if (regex.test(item.name) || regex.test(item.category)) {
          items.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: item.category,
            rating: item.rating,
            restaurant: restaurant.name,
            restaurantId: restaurant._id,
          });
        }
      });
    });

    res.json({ restaurants, items });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/discounted", async (req, res) => {
  try {
    const now = new Date();

    const restaurants = await Restaurant.find({
      menu: {
        $elemMatch: {
          discountPercentage: { $gt: 0 },
          expiryDate: { $gt: now },
        },
      },
    });

    const items = [];
    restaurants.forEach((restaurant) => {
      restaurant.menu.forEach((item) => {
        if (item.discountPercentage > 0 && item.expiryDate && item.expiryDate > now) {
          items.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            discountedPrice: Math.round(item.price * (1 - item.discountPercentage / 100) * 100) / 100,
            discountPercentage: item.discountPercentage,
            expiryDate: item.expiryDate,
            image: item.image,
            category: item.category,
            rating: item.rating,
            restaurant: restaurant.name,
            restaurantId: restaurant._id,
          });
        }
      });
    });

    items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
