import { useState, useEffect, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaSearch, FaUtensils } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import toast from "react-hot-toast";
import "./SearchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ restaurants: [], items: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("restaurants");
  const { user } = useContext(AuthContext);
  const { toggleRestaurant, isRestaurantFav, toggleItem, isItemFav } = useContext(WishlistContext);

  const API = "http://localhost:5000/api/restaurants";

  useEffect(() => {
    if (query) {
      searchData();
    }
  }, [query]);

  const searchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFavRestaurant = (restaurant) => {
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

  const handleFavItem = (item) => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }
    const isFav = isItemFav(item.name, item.restaurant);
    toggleItem({
      name: item.name,
      restaurant: item.restaurant,
      price: item.price,
      image: item.image,
    });
    toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
  };

  const totalResults = results.restaurants.length + results.items.length;

  return (
    <div className="search-page">
      <div className="search-header">
        <FaSearch className="search-header-icon" />
        <h1>
          Search Results for "<span>{query}</span>"
        </h1>
        <p>{totalResults} result{totalResults !== 1 ? "s" : ""} found</p>
      </div>

      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === "restaurants" ? "active" : ""}`}
          onClick={() => setActiveTab("restaurants")}
        >
          Restaurants ({results.restaurants.length})
        </button>
        <button
          className={`search-tab ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          Food Items ({results.items.length})
        </button>
      </div>

      {loading ? (
        <div className="search-loading">Searching...</div>
      ) : (
        <div className="search-content">
          {activeTab === "restaurants" && (
            <>
              {results.restaurants.length === 0 ? (
                <div className="search-empty">
                  <h3>No restaurants found</h3>
                  <p>Try searching with different keywords</p>
                </div>
              ) : (
                <div className="search-grid">
                  {results.restaurants.map((restaurant) => (
                    <div key={restaurant._id} className="search-card">
                      <div className="search-card-image">
                        <Link to={`/restaurant/${restaurant._id}`}>
                          <img src={restaurant.image} alt={restaurant.name} />
                        </Link>
                        <span className="cuisine-badge">{restaurant.cuisine}</span>
                        <button
                          className={`fav-btn ${isRestaurantFav(restaurant._id) ? "fav-active" : ""}`}
                          onClick={() => handleFavRestaurant(restaurant)}
                        >
                          {isRestaurantFav(restaurant._id) ? <FaHeart /> : <FaRegHeart />}
                        </button>
                      </div>
                      <div className="search-card-info">
                        <Link to={`/restaurant/${restaurant._id}`}>
                          <h3>{restaurant.name}</h3>
                        </Link>
                        <div className="search-card-details">
                          <span className="rating">
                            <FaStar className="star-icon" /> {restaurant.rating}
                          </span>
                          <span className="location">
                            <FaMapMarkerAlt /> {restaurant.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "items" && (
            <>
              {results.items.length === 0 ? (
                <div className="search-empty">
                  <h3>No food items found</h3>
                  <p>Try searching with different keywords</p>
                </div>
              ) : (
                <div className="search-items-list">
                  {results.items.map((item) => (
                    <div key={item._id} className="search-item">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="search-item-image" />
                      )}
                      <div className="search-item-info">
                        <h4>{item.name}</h4>
                        <p className="search-item-desc">{item.description}</p>
                        <p className="search-item-restaurant">
                          <FaUtensils /> {item.restaurant}
                        </p>
                        <div className="search-item-meta">
                          <span className="search-item-price">৳{item.price.toFixed(2)}</span>
                          {item.rating > 0 && (
                            <span className="search-item-rating">
                              <FaStar className="star-icon" /> {item.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`item-fav-btn ${isItemFav(item.name, item.restaurant) ? "fav-active" : ""}`}
                        onClick={() => handleFavItem(item)}
                      >
                        {isItemFav(item.name, item.restaurant) ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
