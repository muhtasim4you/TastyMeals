const express = require("express");
const auth = require("../middleware/auth");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

const recomputeRestaurantRating = async (restaurantId) => {
  const reviews = await Review.find({ restaurant: restaurantId });
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.restaurantRating, 0) / reviews.length
      : 0;
  await Restaurant.findByIdAndUpdate(restaurantId, { rating: Math.round(avg * 10) / 10 });
};

router.get("/my", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { orderId, restaurantRating, restaurantComment, deliveryRating, deliveryComment } = req.body;

    if (!orderId || !restaurantRating || !deliveryRating) {
      return res.status(400).json({ message: "Order, restaurant rating, and delivery rating are required" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "You can only review delivered orders" });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }

    const restaurantId = order.items[0]?.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ message: "This order has no restaurant to review" });
    }

    const review = new Review({
      user: req.user.id,
      order: orderId,
      restaurant: restaurantId,
      restaurantRating,
      restaurantComment: restaurantComment || "",
      deliveryRating,
      deliveryComment: deliveryComment || "",
    });
    await review.save();

    await recomputeRestaurantRating(restaurantId);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
