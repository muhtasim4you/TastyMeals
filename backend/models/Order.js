const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemId: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, default: "" },
  restaurant: { type: String, required: true },
  restaurantId: { type: String },
  specialInstructions: { type: String, default: "" },
  extras: [{ type: String }],
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 30 },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    payment: {
      method: { type: String, required: true, enum: ["bkash", "nagad", "bank"] },
      phoneNumber: { type: String, default: "" },
      transactionId: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"],
    },
    statusHistory: [
      {
        status: { type: String },
        time: { type: Date, default: Date.now },
        message: { type: String, default: "" },
      },
    ],
    estimatedDelivery: { type: Date },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
