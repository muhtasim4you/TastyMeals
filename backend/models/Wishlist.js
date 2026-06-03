const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurants: [
      {
        restaurantId: { type: String, required: true },
        name: { type: String, required: true },
        cuisine: { type: String },
        rating: { type: Number },
        location: { type: String },
        image: { type: String },
      },
    ],
    items: [
      {
        name: { type: String, required: true },
        restaurant: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
