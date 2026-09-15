const mongoose = require("mongoose");

const planMealSchema = new mongoose.Schema({
  mealType: { type: String, required: true },
  itemId: { type: String },
  name: { type: String, required: true },
  restaurant: { type: String, required: true },
  restaurantId: { type: String },
  image: { type: String, default: "" },
  price: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: String, required: true },
    targetCalories: { type: Number, required: true },
    macros: {
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
    meals: [planMealSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);
