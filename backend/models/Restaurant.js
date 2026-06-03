const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  category: { type: String, default: "Main" },
});

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cuisine: { type: String, required: true },
    rating: { type: Number, default: 0 },
    location: { type: String, required: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    menu: [menuItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
