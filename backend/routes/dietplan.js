const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const DietPlan = require("../models/DietPlan");

const router = express.Router();

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const MACRO_SPLITS = {
  weight_loss: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  maintenance: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  muscle_gain: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

const MEAL_SLOTS = [
  { mealType: "breakfast", share: 0.25, preferredCategories: ["Sides", "Drinks", "Appetizer"] },
  { mealType: "lunch", share: 0.35, preferredCategories: ["Main"] },
  { mealType: "dinner", share: 0.3, preferredCategories: ["Main"] },
  { mealType: "snack", share: 0.1, preferredCategories: ["Appetizer", "Dessert", "Drinks"] },
];

const MEAT_KEYWORDS = ["chicken", "beef", "pork", "mutton", "lamb", "bacon", "pepperoni", "ham", "sausage", "meat", "steak", "turkey"];
const SEAFOOD_KEYWORDS = ["fish", "shrimp", "prawn", "tuna", "salmon", "sushi", "seafood"];
const DAIRY_EGG_KEYWORDS = ["milk", "cheese", "butter", "cream", "yogurt", "egg", "honey", "lassi"];
const GLUTEN_KEYWORDS = ["bread", "naan", "pasta", "noodle", "bun", "pizza", "wheat", "flour", "biscuit", "tortilla", "croissant"];
const PORK_KEYWORDS = ["pork", "bacon", "ham"];
const SHELLFISH_KEYWORDS = ["shrimp", "prawn", "crab", "lobster"];

const matchesKeyword = (text, keywords) => keywords.some((k) => text.includes(k));

const filterByPreference = (items, preference) => {
  return items.filter((item) => {
    const text = `${item.name} ${item.description}`.toLowerCase();
    switch (preference) {
      case "vegetarian":
        return !matchesKeyword(text, MEAT_KEYWORDS) && !matchesKeyword(text, SEAFOOD_KEYWORDS);
      case "vegan":
        return (
          !matchesKeyword(text, MEAT_KEYWORDS) &&
          !matchesKeyword(text, SEAFOOD_KEYWORDS) &&
          !matchesKeyword(text, DAIRY_EGG_KEYWORDS)
        );
      case "pescatarian":
        return !matchesKeyword(text, MEAT_KEYWORDS);
      case "keto":
        return item.carbs > 0 && item.carbs <= 20;
      case "halal":
      case "kosher":
        return !matchesKeyword(text, PORK_KEYWORDS) && !matchesKeyword(text, SHELLFISH_KEYWORDS);
      case "gluten-free":
        return !matchesKeyword(text, GLUTEN_KEYWORDS);
      default:
        return true;
    }
  });
};

const filterByAllergies = (items, allergies) => {
  if (!allergies || allergies.length === 0) return items;
  const lowerAllergies = allergies.map((a) => a.toLowerCase());
  return items.filter((item) => {
    const text = `${item.name} ${item.description}`.toLowerCase();
    return !lowerAllergies.some((a) => text.includes(a));
  });
};

const pickClosest = (candidates, targetCalories) => {
  return candidates.reduce((best, item) => {
    if (!best) return item;
    return Math.abs(item.calories - targetCalories) < Math.abs(best.calories - targetCalories) ? item : best;
  }, null);
};

router.post("/generate", auth, async (req, res) => {
  try {
    const { age, gender, weightKg, heightCm, activityLevel, goal, preference, allergies } = req.body;

    if (!age || !gender || !weightKg || !heightCm || !activityLevel || !goal) {
      return res.status(400).json({ message: "Age, gender, weight, height, activity level, and goal are required" });
    }

    const user = await User.findById(req.user.id);
    user.dietary.age = age;
    user.dietary.gender = gender;
    user.dietary.weightKg = weightKg;
    user.dietary.heightCm = heightCm;
    user.dietary.activityLevel = activityLevel;
    user.dietary.goal = goal;
    if (preference !== undefined) user.dietary.preference = preference;
    if (allergies !== undefined) user.dietary.allergies = allergies;
    await user.save();

    const bmr =
      gender === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

    let targetCalories = tdee;
    if (goal === "weight_loss") targetCalories -= 500;
    if (goal === "muscle_gain") targetCalories += 300;
    targetCalories = Math.max(1200, Math.round(targetCalories));

    const split = MACRO_SPLITS[goal];
    const macros = {
      protein: Math.round((targetCalories * split.protein) / 4),
      carbs: Math.round((targetCalories * split.carbs) / 4),
      fat: Math.round((targetCalories * split.fat) / 9),
    };

    const restaurants = await Restaurant.find();
    let candidates = [];
    restaurants.forEach((r) => {
      r.menu.forEach((item) => {
        if (item.calories > 0) {
          candidates.push({
            itemId: item._id.toString(),
            name: item.name,
            description: item.description,
            category: item.category,
            restaurant: r.name,
            restaurantId: r._id.toString(),
            image: item.image,
            price: item.price,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          });
        }
      });
    });

    candidates = filterByPreference(candidates, user.dietary.preference);
    candidates = filterByAllergies(candidates, user.dietary.allergies);

    if (candidates.length === 0) {
      return res.status(400).json({
        message: "Not enough menu items currently match your dietary preferences and allergies to build a plan",
      });
    }

    const usedIds = new Set();
    const meals = MEAL_SLOTS.map((slot) => {
      const mealTargetCalories = targetCalories * slot.share;
      let pool = candidates.filter((c) => !usedIds.has(c.itemId));
      if (pool.length === 0) pool = candidates;

      let preferredPool = pool.filter((c) => slot.preferredCategories.includes(c.category));
      if (preferredPool.length === 0) preferredPool = pool;

      const chosen = pickClosest(preferredPool, mealTargetCalories);
      usedIds.add(chosen.itemId);

      return {
        mealType: slot.mealType,
        itemId: chosen.itemId,
        name: chosen.name,
        restaurant: chosen.restaurant,
        restaurantId: chosen.restaurantId,
        image: chosen.image,
        price: chosen.price,
        calories: chosen.calories,
        protein: chosen.protein,
        carbs: chosen.carbs,
        fat: chosen.fat,
      };
    });

    const plan = new DietPlan({
      user: req.user.id,
      goal,
      targetCalories,
      macros,
      meals,
    });
    await plan.save();

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const plans = await DietPlan.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
