const mongoose = require("mongoose");

const wastageLogSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, default: "Main" },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "portions" },
    reason: {
      type: String,
      enum: ["unsold", "spoiled", "overproduction", "quality_issue", "other"],
      default: "unsold",
    },
    estimatedValue: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WastageLog", wastageLogSchema);
