import { useContext, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaUtensils, FaStore, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import "../admin/Admin.css";

const MerchantLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || user.role !== "merchant") {
      navigate("/login");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user || user.role !== "merchant") return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <FaUtensils />
          <span>TastyMeals</span>
        </div>
        <nav className="admin-nav">
          <Link to="/merchant" className={`admin-nav-item ${isActive("/merchant") ? "active" : ""}`}>
            <FaStore /> My Restaurant
          </Link>
          <Link to="/merchant/menu" className={`admin-nav-item ${isActive("/merchant/menu") ? "active" : ""}`}>
            <FaClipboardList /> Menu
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

export default MerchantLayout;
