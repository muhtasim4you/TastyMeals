import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import "./TopRestaurants.css";

const TopRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const { user } = useContext(AuthContext);
  const { toggleRestaurant, isRestaurantFav } = useContext(WishlistContext);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/restaurants");
      setRestaurants(res.data);
    } catch (error) {
      console.error("Failed to fetch restaurants");
    }
  };

  const handleFav = (e, restaurant) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }
    const isFav = isRestaurantFav(restaurant._id);
    toggleRestaurant({
      restaurantId: restaurant._id,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      location: restaurant.location,
      image: restaurant.image,
    });
    toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <section className="top-restaurants">
      <h2 className="section-title">Top Restaurants</h2>
      <p className="section-subtitle">Recommended for you</p>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <Link
            to={`/restaurant/${restaurant._id}`}
            key={restaurant._id}
            className="restaurant-card"
          >
            <div className="card-image">
              <img src={restaurant.image} alt={restaurant.name} />
              <span className="cuisine-badge">{restaurant.cuisine}</span>
              <button
                className={`fav-btn ${isRestaurantFav(restaurant._id) ? "fav-active" : ""}`}
                onClick={(e) => handleFav(e, restaurant)}
              >
                {isRestaurantFav(restaurant._id) ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
            <div className="card-info">
              <h3>{restaurant.name}</h3>
              <p className="card-description">{restaurant.description}</p>
              <div className="card-details">
                <span className="rating">
                  <FaStar className="star-icon" /> {restaurant.rating}
                </span>
                <span className="location">
                  <FaMapMarkerAlt /> {restaurant.location}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TopRestaurants;
