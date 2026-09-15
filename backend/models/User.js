const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "merchant"],
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
    },
    payment: {
      cardName: { type: String, default: "" },
      cardNumber: { type: String, default: "" },
      expiry: { type: String, default: "" },
      cvv: { type: String, default: "" },
    },
    dietary: {
      preference: { type: String, default: "none" },
      allergies: [{ type: String }],
      age: { type: Number, default: null },
      gender: { type: String, enum: ["male", "female"], default: "male" },
      weightKg: { type: Number, default: null },
      heightCm: { type: Number, default: null },
      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "active", "very_active"],
        default: "moderate",
      },
      goal: {
        type: String,
        enum: ["weight_loss", "maintenance", "muscle_gain"],
        default: "maintenance",
      },
    },
    rewardPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
