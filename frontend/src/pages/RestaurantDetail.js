import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaStar, FaRegStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaShoppingCart, FaTimes, FaPlus, FaMinus, FaLeaf, FaTruck, FaCommentDots } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";
import { API_BASE } from "../config";
import "./RestaurantDetail.css";

const isRescuedDeal = (item) =>
  item.discountPercentage > 0 && item.expiryDate && new Date(item.expiryDate) > new Date();

const effectivePrice = (item) =>
  isRescuedDeal(item) ? item.price * (1 - item.discountPercentage / 100) : item.price;

const extraOptions = [
  "Extra Cheese",
  "Extra Sauce",
  "No Onions",
  "No Spice",
  "Extra Spicy",
  "Gluten Free",
  "Add Avocado",
  "Double Portion",
];

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedExtras, setSelectedExtras] = useState([]);

  const { user } = useContext(AuthContext);
  const { toggleRestaurant, isRestaurantFav, toggleItem, isItemFav } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const API = `${API_BASE}/api/restaurants`;

  useEffect(() => {
    fetchRestaurant();
    fetchReviews();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(`${API}/${id}`);
      setRestaurant(res.data);
    } catch (error) {
      toast.error("Failed to load restaurant");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/reviews/restaurant/${id}`);
      setReviews(res.data);
    } catch (error) {
      // reviews are supplementary; fail silently
    }
  };

  const handleFavRestaurant = () => {
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
    const isFav = isItemFav(item.name, restaurant.name);
    toggleItem({
      itemId: item._id,
      restaurantId: restaurant._id,
      name: item.name,
      restaurant: restaurant.name,
      price: item.price,
      image: item.image,
    });
    toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
  };

  const openCustomizeModal = (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setSelectedItem(item);
    setQuantity(1);
    setSpecialInstructions("");
    setSelectedExtras([]);
    setShowModal(true);
  };

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const handleAddToCart = async () => {
    const rescued = isRescuedDeal(selectedItem);
    const success = await addToCart({
      itemId: selectedItem._id,
      name: selectedItem.name,
      price: effectivePrice(selectedItem),
      quantity,
      image: selectedItem.image,
      restaurant: restaurant.name,
      restaurantId: restaurant._id,
      specialInstructions,
      extras: selectedExtras,
      isRescuedDeal: rescued,
    });
    if (success) {
      toast.success(
        rescued
          ? `${selectedItem.name} added to cart! You'll earn reward points for rescuing this item.`
          : `${selectedItem.name} added to cart!`
      );
      setShowModal(false);
    } else {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) {
    return <div className="detail-loading">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="detail-loading">Restaurant not found</div>;
  }

  const categories = ["All", ...new Set(restaurant.menu.map((item) => item.category))];
  const filteredMenu =
    activeCategory === "All"
      ? restaurant.menu
      : restaurant.menu.filter((item) => item.category === activeCategory);

  return (
    <div className="detail-page">
      <div className="detail-banner">
        <img src={restaurant.image} alt={restaurant.name} />
        <div className="detail-banner-overlay">
          <div className="detail-banner-content">
            <span className="detail-cuisine">{restaurant.cuisine}</span>
            <h1>{restaurant.name}</h1>
            <p>{restaurant.description}</p>
            <div className="detail-meta">
              <span className="detail-rating">
                <FaStar /> {restaurant.rating}
              </span>
              <span className="detail-location">
                <FaMapMarkerAlt /> {restaurant.location}
              </span>
            </div>
            <button
              className={`detail-fav-btn ${isRestaurantFav(restaurant._id) ? "fav-active" : ""}`}
              onClick={handleFavRestaurant}
            >
              {isRestaurantFav(restaurant._id) ? <FaHeart /> : <FaRegHeart />}
              {isRestaurantFav(restaurant._id) ? " Saved" : " Save to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <div className="detail-menu">
        <h2>Menu</h2>
        <div className="menu-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`menu-cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredMenu.map((item) => (
            <div key={item._id} className="menu-item-card">
              {item.image && (
                <img src={item.image} alt={item.name} className="menu-item-image" />
              )}
              {isRescuedDeal(item) && (
                <span className="menu-item-deal-badge">
                  <FaLeaf /> -{item.discountPercentage}% Rescue Deal
                </span>
              )}
              <div className="menu-item-info">
                <h4>{item.name}</h4>
                <p className="menu-item-desc">{item.description}</p>
                <div className="menu-item-rating">
                  <FaStar className="menu-star" />
                  <span>{item.rating}</span>
                </div>
                <div className="menu-item-bottom">
                  {isRescuedDeal(item) ? (
                    <span className="menu-item-price">
                      <span className="menu-item-price-original">৳{item.price.toFixed(2)}</span>
                      ৳{effectivePrice(item).toFixed(2)}
                    </span>
                  ) : (
                    <span className="menu-item-price">৳{item.price.toFixed(2)}</span>
                  )}
                  <div className="menu-item-actions">
                    <button
                      className={`menu-fav-btn ${isItemFav(item.name, restaurant.name) ? "fav-active" : ""}`}
                      onClick={() => handleFavItem(item)}
                    >
                      {isItemFav(item.name, restaurant.name) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                    <button
                      className="add-cart-btn"
                      onClick={() => openCustomizeModal(item)}
                    >
                      <FaShoppingCart /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-reviews">
        <h2><FaCommentDots /> Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet. Be the first to review after your order is delivered!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-card-header">
                  <span className="review-author">{r.user?.name || "Anonymous"}</span>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="review-rating-row">
                  <span className="review-rating-label">
                    <FaStar /> Food:
                    {[1, 2, 3, 4, 5].map((n) => (
                      n <= r.restaurantRating ? <FaStar key={n} className="review-star-filled" /> : <FaRegStar key={n} className="review-star-empty" />
                    ))}
                  </span>
                  <span className="review-rating-label">
                    <FaTruck /> Delivery:
                    {[1, 2, 3, 4, 5].map((n) => (
                      n <= r.deliveryRating ? <FaStar key={n} className="review-star-filled" /> : <FaRegStar key={n} className="review-star-empty" />
                    ))}
                  </span>
                </div>
                {r.restaurantComment && <p className="review-comment">{r.restaurantComment}</p>}
                {r.deliveryComment && <p className="review-comment review-comment-delivery">Delivery: {r.deliveryComment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="customize-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>

            <div className="modal-header">
              {selectedItem.image && (
                <img src={selectedItem.image} alt={selectedItem.name} className="modal-image" />
              )}
              <div>
                <h3>{selectedItem.name}</h3>
                <p className="modal-desc">{selectedItem.description}</p>
                {isRescuedDeal(selectedItem) ? (
                  <p className="modal-price">
                    <span className="menu-item-price-original">৳{selectedItem.price.toFixed(2)}</span>
                    ৳{effectivePrice(selectedItem).toFixed(2)}
                    <span className="modal-rescue-tag"><FaLeaf /> Rescue Deal</span>
                  </p>
                ) : (
                  <p className="modal-price">৳{selectedItem.price.toFixed(2)}</p>
                )}
              </div>
            </div>

            <div className="modal-section">
              <h4>Quantity</h4>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <FaMinus />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="modal-section">
              <h4>Customize Your Order</h4>
              <div className="extras-grid">
                {extraOptions.map((extra) => (
                  <button
                    key={extra}
                    className={`extra-chip ${selectedExtras.includes(extra) ? "selected" : ""}`}
                    onClick={() => toggleExtra(extra)}
                  >
                    {extra}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Special Instructions</h4>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (e.g., allergies, cooking preferences)"
                rows={3}
              />
            </div>

            <div className="modal-footer">
              <div className="modal-total">
                Total: <span>৳{(effectivePrice(selectedItem) * quantity).toFixed(2)}</span>
              </div>
              <button className="modal-add-btn" onClick={handleAddToCart}>
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
