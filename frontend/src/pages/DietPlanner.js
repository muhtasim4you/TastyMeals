import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaAppleAlt, FaFire, FaDrumstickBite, FaBreadSlice, FaTint, FaUtensils, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";
import "./DietPlanner.css";

const dietaryOptions = ["none", "vegetarian", "vegan", "pescatarian", "keto", "halal", "kosher", "gluten-free"];

const activityLabels = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light (exercise 1-3 days/week)",
  moderate: "Moderate (exercise 3-5 days/week)",
  active: "Active (exercise 6-7 days/week)",
  very_active: "Very Active (hard exercise daily)",
};

const goalLabels = {
  weight_loss: "Lose Weight",
  maintenance: "Maintain Weight",
  muscle_gain: "Gain Muscle",
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const DietPlanner = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: "", gender: "male", weightKg: "", heightCm: "",
    activityLevel: "moderate", goal: "maintenance", preference: "none",
  });
  const [allergies, setAllergies] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchHistory();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = res.data.dietary || {};
      setForm({
        age: d.age || "",
        gender: d.gender || "male",
        weightKg: d.weightKg || "",
        heightCm: d.heightCm || "",
        activityLevel: d.activityLevel || "moderate",
        goal: d.goal || "maintenance",
        preference: d.preference || "none",
      });
      setAllergies(d.allergies || []);
    } catch (error) {
      // profile prefill is best-effort
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dietplan/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (error) {
      // history is optional
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/dietplan/generate",
        { ...form, allergies },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlan(res.data);
      setHistory([res.data, ...history]);
      toast.success("Your personalized diet plan is ready!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const macroPct = (grams, kcalPerGram, total) =>
    total > 0 ? Math.round((grams * kcalPerGram * 100) / total) : 0;

  return (
    <div className="diet-page">
      <div className="diet-header">
        <FaAppleAlt className="diet-header-icon" />
        <h1>Personalized Diet Planner</h1>
        <p>Tell us about yourself and we'll build a daily meal plan from our partner restaurants</p>
      </div>

      <div className="diet-form-card">
        <h3>Your Profile & Goal</h3>
        <form onSubmit={handleGenerate}>
          <div className="diet-form-row">
            <div className="diet-form-group">
              <label>Age</label>
              <input type="number" min="10" max="100" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </div>
            <div className="diet-form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="diet-form-row">
            <div className="diet-form-group">
              <label>Weight (kg)</label>
              <input type="number" min="20" max="300" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} required />
            </div>
            <div className="diet-form-group">
              <label>Height (cm)</label>
              <input type="number" min="100" max="250" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} required />
            </div>
          </div>
          <div className="diet-form-group">
            <label>Activity Level</label>
            <select value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
              {Object.entries(activityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="diet-form-row">
            <div className="diet-form-group">
              <label>Health Goal</label>
              <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                {Object.entries(goalLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="diet-form-group">
              <label>Diet Type</label>
              <select value={form.preference} onChange={(e) => setForm({ ...form, preference: e.target.value })}>
                {dietaryOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          {allergies.length > 0 && (
            <p className="diet-allergy-note">
              Avoiding: {allergies.join(", ")} · <Link to="/profile">Manage allergies</Link>
            </p>
          )}
          <button type="submit" className="diet-generate-btn" disabled={generating}>
            {generating ? "Generating..." : "Generate My Diet Plan"}
          </button>
        </form>
      </div>

      {plan && (
        <div className="diet-result">
          <div className="diet-stats-grid">
            <div className="diet-stat-card diet-stat-red">
              <FaFire className="diet-stat-icon" />
              <div>
                <h3>{plan.targetCalories}</h3>
                <p>Target Calories/day</p>
              </div>
            </div>
            <div className="diet-stat-card diet-stat-blue">
              <FaDrumstickBite className="diet-stat-icon" />
              <div>
                <h3>{plan.macros.protein}g</h3>
                <p>Protein ({macroPct(plan.macros.protein, 4, plan.targetCalories)}%)</p>
              </div>
            </div>
            <div className="diet-stat-card diet-stat-orange">
              <FaBreadSlice className="diet-stat-icon" />
              <div>
                <h3>{plan.macros.carbs}g</h3>
                <p>Carbs ({macroPct(plan.macros.carbs, 4, plan.targetCalories)}%)</p>
              </div>
            </div>
            <div className="diet-stat-card diet-stat-green">
              <FaTint className="diet-stat-icon" />
              <div>
                <h3>{plan.macros.fat}g</h3>
                <p>Fat ({macroPct(plan.macros.fat, 9, plan.targetCalories)}%)</p>
              </div>
            </div>
          </div>

          <h3 className="diet-meals-title"><FaUtensils /> Today's Meal Plan</h3>
          <div className="diet-meals-grid">
            {plan.meals.map((meal, i) => (
              <div key={i} className="diet-meal-card">
                <span className="diet-meal-type">{mealLabels[meal.mealType]}</span>
                {meal.image && <img src={meal.image} alt={meal.name} className="diet-meal-image" />}
                <div className="diet-meal-info">
                  <h4>{meal.name}</h4>
                  <p className="diet-meal-restaurant">{meal.restaurant}</p>
                  <p className="diet-meal-macros">{meal.calories} kcal · P{meal.protein} C{meal.carbs} F{meal.fat}</p>
                  <div className="diet-meal-bottom">
                    <span className="diet-meal-price">৳{meal.price.toFixed(2)}</span>
                    {meal.restaurantId && (
                      <Link to={`/restaurant/${meal.restaurantId}`} className="diet-meal-link">Order</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="diet-history">
          <h3><FaHistory /> Plan History</h3>
          <div className="diet-history-list">
            {history.map((h) => (
              <button key={h._id} className="diet-history-row" onClick={() => setPlan(h)}>
                <span>{goalLabels[h.goal] || h.goal}</span>
                <span>{h.targetCalories} kcal/day</span>
                <span className="diet-history-date">{new Date(h.createdAt).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanner;
