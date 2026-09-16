import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { RewardContext } from "../context/RewardContext";
import { FaUtensils, FaSearch, FaShoppingCart, FaBell, FaSeedling, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { unreadCount } = useContext(NotificationContext);
  const { balance } = useContext(RewardContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      closeMenu();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <FaUtensils className="brand-icon" />
          <span>TastyMeals</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search restaurants or food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <ul className="navbar-center">
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/offers" onClick={closeMenu}>Offers</Link></li>
          {user && (
            <>
              <li><Link to="/wishlist" onClick={closeMenu}>Wishlist</Link></li>
              <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
            </>
          )}
        </ul>
        <ul className="navbar-right">
          {user ? (
            <>
              <li>
                <Link to="/rewards" className="rewards-pill" onClick={closeMenu}>
                  <FaSeedling /> {balance}
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="cart-link" onClick={closeMenu}>
                  <FaBell />
                  {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
                  <span className="navbar-link-label">Notifications</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="cart-link" onClick={closeMenu}>
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  <span className="navbar-link-label">Cart</span>
                </Link>
              </li>
              <li className="navbar-user">Hi, {user.name}</li>
              <li>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
              <li><Link to="/register" className="btn-register" onClick={closeMenu}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
