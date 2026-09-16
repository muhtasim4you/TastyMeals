import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaTags, FaCopy, FaFire, FaStar, FaHeart, FaRegHeart, FaUtensils, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { API_BASE } from "../config";
import "./Offers.css";
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

const Offers = () => {
  const [tab, setTab] = useState("deals");
  const { user } = useContext(AuthContext);
  const { toggleItem, isItemFav } = useContext(WishlistContext);

  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
    fetchPromos();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/restaurants/discounted`);
      setDeals(res.data);
    } catch (error) {
      toast.error("Failed to load deals");
    } finally {
      setDealsLoading(false);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/promos`);
      setPromos(res.data);
    } catch (error) {
      toast.error("Failed to load offers");
    } finally {
      setPromosLoading(false);
    }
  };

  const handleFavItem = (item) => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }
    const isFav = isItemFav(item.name, item.restaurant);
    toggleItem({
      itemId: item._id,
      restaurantId: item.restaurantId,
      name: item.name,
      restaurant: item.restaurant,
      price: item.discountedPrice,
      image: item.image,
    });
    toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" — paste it at checkout!`);
  };

  return (
    <div className="offers-page">
      <div className="offers-header">
        <FaTags className="offers-header-icon" />
        <h1>Deals &amp; Promotional Offers</h1>
        <p>Discounted items nearing expiry and promo codes you can apply at checkout</p>
      </div>

      <div className="offers-tab-bar">
        <button
          className={`offers-tab-btn ${tab === "deals" ? "active" : ""}`}
          onClick={() => setTab("deals")}
        >
          <FaFire /> Deals Nearing Expiry
        </button>
        <button
          className={`offers-tab-btn ${tab === "promos" ? "active" : ""}`}
          onClick={() => setTab("promos")}
        >
          <FaTags /> Promo Codes
        </button>
      </div>

      {tab === "deals" ? (
        dealsLoading ? (
          <div className="offers-loading">Loading deals...</div>
        ) : deals.length === 0 ? (
          <div className="offers-empty">
            <h3>No deals right now</h3>
            <p>Check back soon for discounted items nearing expiry</p>
          </div>
        ) : (
          <div className="deals-grid">
            {deals.map((item) => (
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
        )
      ) : promosLoading ? (
        <div className="offers-loading">Loading offers...</div>
      ) : promos.length === 0 ? (
        <div className="offers-empty">
          <h3>No active offers right now</h3>
          <p>Check back soon for new promo codes and discounts.</p>
        </div>
      ) : (
        <div className="offers-grid">
          {promos.map((p) => (
            <div key={p._id} className="offer-card">
              <div className="offer-discount">
                {p.discountType === "percentage" ? `${p.discountValue}% OFF` : `৳${p.discountValue} OFF`}
              </div>
              {p.description && <p className="offer-desc">{p.description}</p>}
              <div className="offer-meta">
                {p.minOrderValue > 0 && <span>Min. order ৳{p.minOrderValue}</span>}
                {p.discountType === "percentage" && p.maxDiscount && <span>Up to ৳{p.maxDiscount}</span>}
                {p.expiryDate && <span>Valid till {new Date(p.expiryDate).toLocaleDateString()}</span>}
              </div>
              <button className="offer-code-btn" onClick={() => copyCode(p.code)}>
                <span className="offer-code">{p.code}</span>
                <FaCopy />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
