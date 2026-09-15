import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaStore, FaUser, FaEnvelope, FaKey, FaSignInAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const MerchantRegister = () => {
  const { registerMerchant, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    restaurantName: "", cuisine: "", location: "", image: "", description: "",
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const result = await registerMerchant(form);
    if (result.success) {
      toast.success("Restaurant registered! Welcome to TastyMeals.");
      navigate("/merchant");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-left">
        <div className="admin-login-branding">
          <FaStore className="admin-shield-icon" />
          <h1>TastyMeals</h1>
          <h2>Partner With Us</h2>
          <p>
            Register your restaurant, publish your menu, and start receiving orders
            from thousands of hungry customers across Bangladesh.
          </p>
          <div className="admin-features-list">
            <div className="admin-feature"><span className="feature-dot"></span>Your own restaurant dashboard</div>
            <div className="admin-feature"><span className="feature-dot"></span>Add, edit, and delete your menu anytime</div>
            <div className="admin-feature"><span className="feature-dot"></span>Run discounts on items nearing expiry</div>
          </div>
        </div>
      </div>
      <div className="admin-login-right scrollable">
        <div className="admin-login-card wide">
          <div className="admin-login-header">
            <div className="admin-avatar"><FaStore /></div>
            <h2>Register Your Restaurant</h2>
            <p>Create a merchant account to start selling on TastyMeals</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-input-group">
              <FaUser className="input-icon" />
              <input value={form.name} onChange={update("name")} placeholder="Your full name" required />
            </div>
            <div className="admin-input-group">
              <FaEnvelope className="input-icon" />
              <input type="email" value={form.email} onChange={update("email")} placeholder="Email address" required />
            </div>
            <div className="admin-input-group">
              <FaKey className="input-icon" />
              <input type="password" value={form.password} onChange={update("password")} placeholder="Password (min 6 characters)" required />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Restaurant Name</label>
                <input value={form.restaurantName} onChange={update("restaurantName")} required />
              </div>
              <div className="admin-form-group">
                <label>Cuisine</label>
                <input value={form.cuisine} onChange={update("cuisine")} placeholder="e.g. Italian" required />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Location</label>
                <input value={form.location} onChange={update("location")} placeholder="e.g. Gulshan, Dhaka" required />
              </div>
              <div className="admin-form-group">
                <label>Image URL (optional)</label>
                <input value={form.image} onChange={update("image")} placeholder="https://..." />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Description (optional)</label>
              <textarea value={form.description} onChange={update("description")} rows={2} />
            </div>

            <button type="submit" className="admin-login-btn" disabled={loading}>
              <FaSignInAlt /> {loading ? "Creating account..." : "Register Restaurant"}
            </button>
          </form>
          <div className="admin-login-footer with-link">
            <p>Already a partner? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantRegister;
