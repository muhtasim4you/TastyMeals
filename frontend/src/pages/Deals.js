import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaStar, FaHeart, FaRegHeart, FaUtensils, FaClock, FaFire } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import "./Deals.css";

const timeLeft = (expiryDate) => {
  const diffMs = new Date(expiryDate) - new Date();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

const Deals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { toggleItem, isItemFav } = useContext(WishlistContext);

  const API = "http://localhost:5000/api/restaurants/discounted";

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(API);
      setItems(res.data);
    } catch (error) {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleFavItem = (item) => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }
    const isFav = isItemFav(item.name, item.restaurant);
    toggleItem({
      name: item.name,
      restaurant: item.restaurant,
      price: item.discountedPrice,
      image: item.image,
    });
    toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="deals-page">
      <div className="deals-header">
        <FaFire className="deals-header-icon" />
        <h1>Deals Nearing Expiry</h1>
        <p>Grab discounted food items before they run out</p>
      </div>

      {loading ? (
        <div className="deals-loading">Loading deals...</div>
      ) : items.length === 0 ? (
        <div className="deals-empty">
          <h3>No deals right now</h3>
          <p>Check back soon for discounted items nearing expiry</p>
        </div>
      ) : (
        <div className="deals-grid">
          {items.map((item) => (
            <div key={item._id} className="deal-card">
              <div className="deal-card-image">
                <Link to={`/restaurant/${item.restaurantId}`}>
                  {item.image && <img src={item.image} alt={item.name} />}
                </Link>
                <span className="discount-badge">-{item.discountPercentage}%</span>
                <button
                  className={`fav-btn ${isItemFav(item.name, item.restaurant) ? "fav-active" : ""}`}
                  onClick={() => handleFavItem(item)}
                >
                  {isItemFav(item.name, item.restaurant) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
              <div className="deal-card-info">
                <Link to={`/restaurant/${item.restaurantId}`}>
                  <h3>{item.name}</h3>
                </Link>
                <p className="deal-restaurant">
                  <FaUtensils /> {item.restaurant}
                </p>
                <div className="deal-price-row">
                  <span className="deal-original-price">৳{item.price.toFixed(2)}</span>
                  <span className="deal-discounted-price">৳{item.discountedPrice.toFixed(2)}</span>
                </div>
                <div className="deal-meta">
                  {item.rating > 0 && (
                    <span className="deal-rating">
                      <FaStar className="star-icon" /> {item.rating}
                    </span>
                  )}
                  <span className="deal-expiry">
                    <FaClock /> {timeLeft(item.expiryDate)}
                  </span>
                </div>
                <Link to={`/restaurant/${item.restaurantId}`} className="deal-order-btn">
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deals;
