import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { RewardContext } from "../context/RewardContext";
import { FaUtensils, FaSearch, FaShoppingCart, FaBell, FaSeedling } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { unreadCount } = useContext(NotificationContext);
  const { balance } = useContext(RewardContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
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

      <ul className="navbar-center">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/offers">Offers</Link></li>
        {user && (
          <>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        )}
      </ul>
      <ul className="navbar-right">
        {user ? (
          <>
            <li>
              <Link to="/rewards" className="rewards-pill">
                <FaSeedling /> {balance}
              </Link>
            </li>
            <li>
              <Link to="/notifications" className="cart-link">
                <FaBell />
                {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
              </Link>
            </li>
            <li>
              <Link to="/cart" className="cart-link">
                <FaShoppingCart />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </li>
            <li className="navbar-user">Hi, {user.name}</li>
            <li>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="btn-register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
