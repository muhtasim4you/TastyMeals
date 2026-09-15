const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    charity: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", required: true },
    foodItem: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "portions" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "picked_up", "cancelled"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
