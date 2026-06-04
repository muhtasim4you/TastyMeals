import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaShieldAlt, FaEnvelope, FaKey, FaSignInAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (stored && stored.role === "admin") {
        toast.success("Welcome, Admin!");
        navigate("/admin");
      } else {
        toast.error("Access denied. Admin only.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-left">
        <div className="admin-login-branding">
          <FaShieldAlt className="admin-shield-icon" />
          <h1>TastyMeals</h1>
          <h2>Admin Control Panel</h2>
          <p>Manage restaurants, menus, orders, users, and track deliveries — all from one place.</p>
          <div className="admin-features-list">
            <div className="admin-feature">
              <span className="feature-dot"></span>
              Restaurant & Menu Management
            </div>
            <div className="admin-feature">
              <span className="feature-dot"></span>
              Order Tracking & Status Control
            </div>
            <div className="admin-feature">
              <span className="feature-dot"></span>
              User Management & Analytics
            </div>
            <div className="admin-feature">
              <span className="feature-dot"></span>
              Revenue & Profit Overview
            </div>
          </div>
        </div>
      </div>
      <div className="admin-login-right">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-avatar">
              <FaShieldAlt />
            </div>
            <h2>Admin Sign In</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="admin-input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email address"
                required
              />
            </div>
            <div className="admin-input-group">
              <FaKey className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
              />
            </div>
            <button type="submit" className="admin-login-btn" disabled={loading}>
              <FaSignInAlt /> {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
          <div className="admin-login-footer">
            <p>Authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
