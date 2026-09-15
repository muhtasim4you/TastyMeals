const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ["earned", "redeemed"], required: true },
    reason: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RewardTransaction", rewardTransactionSchema);
