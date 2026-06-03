import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { FaStar, FaMapMarkerAlt, FaTrash, FaHeart, FaUtensils } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Wishlist.css";

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { wishlist, removeRestaurant, removeItem } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("restaurants");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  const handleRemoveRestaurant = (restaurantId, name) => {
    removeRestaurant(restaurantId);
    toast.success(`${name} removed from wishlist`);
  };

  const handleRemoveItem = (itemId, name) => {
    removeItem(itemId);
    toast.success(`${name} removed from wishlist`);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <FaHeart className="wishlist-icon" />
        <h1>My Wishlist</h1>
        <p>Your favorite restaurants and items for easy reordering</p>
      </div>

      <div className="wishlist-tabs">
        <button
          className={`wishlist-tab ${activeTab === "restaurants" ? "active" : ""}`}
          onClick={() => setActiveTab("restaurants")}
        >
          <FaUtensils /> Restaurants ({wishlist.restaurants.length})
        </button>
        <button
          className={`wishlist-tab ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          <FaStar /> Favorite Items ({wishlist.items.length})
        </button>
      </div>

      <div className="wishlist-content">
        {activeTab === "restaurants" && (
          <>
            {wishlist.restaurants.length === 0 ? (
              <div className="wishlist-empty">
                <FaUtensils className="empty-icon" />
                <h3>No favorite restaurants yet</h3>
                <p>Browse restaurants and tap the heart icon to save your favorites</p>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.restaurants.map((restaurant) => (
                  <div key={restaurant.restaurantId} className="wishlist-card">
                    <div className="wishlist-card-image">
                      <img src={restaurant.image} alt={restaurant.name} />
                      <span className="cuisine-badge">{restaurant.cuisine}</span>
                    </div>
                    <div className="wishlist-card-info">
                      <h3>{restaurant.name}</h3>
                      <div className="wishlist-card-details">
                        <span className="rating">
                          <FaStar className="star-icon" /> {restaurant.rating}
                        </span>
                        <span className="location">
                          <FaMapMarkerAlt /> {restaurant.location}
                        </span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveRestaurant(restaurant.restaurantId, restaurant.name)}
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "items" && (
          <>
            {wishlist.items.length === 0 ? (
              <div className="wishlist-empty">
                <FaStar className="empty-icon" />
                <h3>No favorite items yet</h3>
                <p>Order food and save your favorites for quick reordering</p>
              </div>
            ) : (
              <div className="wishlist-items-list">
                {wishlist.items.map((item) => (
                  <div key={item._id} className="wishlist-item">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="item-image" />
                    )}
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-restaurant">{item.restaurant}</p>
                      <p className="item-price">${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item._id, item.name)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
