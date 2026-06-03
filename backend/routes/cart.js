const express = require("express");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const { itemId, name, price, quantity, image, restaurant, restaurantId, specialInstructions, extras } = req.body;

    const existingIndex = cart.items.findIndex(
      (item) => item.itemId === itemId && item.specialInstructions === (specialInstructions || "") &&
        JSON.stringify(item.extras || []) === JSON.stringify(extras || [])
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        itemId,
        name,
        price,
        quantity: quantity || 1,
        image,
        restaurant,
        restaurantId,
        specialInstructions: specialInstructions || "",
        extras: extras || [],
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update/:cartItemId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.cartItemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const { quantity, specialInstructions, extras } = req.body;
    if (quantity !== undefined) item.quantity = quantity;
    if (specialInstructions !== undefined) item.specialInstructions = specialInstructions;
    if (extras !== undefined) item.extras = extras;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((i) => i._id.toString() !== req.params.cartItemId);
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/remove/:cartItemId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.cartItemId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
