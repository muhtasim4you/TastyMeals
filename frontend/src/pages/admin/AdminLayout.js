import { useContext, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  FaUtensils,
  FaTachometerAlt,
  FaStore,
  FaUsers,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Admin.css";

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user || user.role !== "admin") return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <FaUtensils />
          <span>TastyMeals</span>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={`admin-nav-item ${isActive("/admin") ? "active" : ""}`}>
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link to="/admin/restaurants" className={`admin-nav-item ${location.pathname.startsWith("/admin/restaurants") ? "active" : ""}`}>
            <FaStore /> Restaurants
          </Link>
          <Link to="/admin/users" className={`admin-nav-item ${isActive("/admin/users") ? "active" : ""}`}>
            <FaUsers /> Users
          </Link>
          <Link to="/admin/orders" className={`admin-nav-item ${isActive("/admin/orders") ? "active" : ""}`}>
            <FaClipboardList /> Orders
          </Link>
          <Link to="/admin/settings" className={`admin-nav-item ${isActive("/admin/settings") ? "active" : ""}`}>
            <FaCog /> Settings
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-name">{user.name}</p>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
