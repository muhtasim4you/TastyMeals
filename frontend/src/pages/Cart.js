import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaEdit, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Cart.css";

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

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, updateCartItem, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState(null);
  const [editInstructions, setEditInstructions] = useState("");
  const [editExtras, setEditExtras] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [vatRate, setVatRate] = useState(5);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/settings");
      setDeliveryFee(res.data.deliveryFee);
      setVatRate(res.data.vatRate);
    } catch (error) {
      console.error("Failed to fetch settings");
    }
  };

  const tax = cartTotal * (vatRate / 100);

  const handleQuantityChange = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      toast.success("Item removed from cart");
    } else {
      updateCartItem(cartItemId, { quantity: newQty });
    }
  };

  const handleRemove = (cartItemId, name) => {
    removeFromCart(cartItemId);
    toast.success(`${name} removed from cart`);
  };

  const handleClear = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditInstructions(item.specialInstructions || "");
    setEditExtras(item.extras || []);
  };

  const toggleEditExtra = (extra) => {
    setEditExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const saveCustomization = () => {
    updateCartItem(editingItem._id, {
      specialInstructions: editInstructions,
      extras: editExtras,
    });
    toast.success("Order customization updated");
    setEditingItem(null);
  };

  const groupedByRestaurant = cart.items.reduce((groups, item) => {
    const key = item.restaurant;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  return (
    <div className="cart-page">
      <div className="cart-header">
        <FaShoppingCart className="cart-header-icon" />
        <h1>Your Cart</h1>
        <p>{cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your cart</p>
      </div>

      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <FaShoppingCart className="empty-icon" />
          <h3>Your cart is empty</h3>
          <p>Browse restaurants and add delicious items to your cart</p>
          <button className="browse-btn" onClick={() => navigate("/")}>
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {Object.entries(groupedByRestaurant).map(([restaurant, items]) => (
              <div key={restaurant} className="cart-group">
                <h3 className="cart-group-title">{restaurant}</h3>
                {items.map((item) => (
                  <div key={item._id} className="cart-item">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                    )}
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">৳{item.price.toFixed(2)} each</p>
                      {item.extras && item.extras.length > 0 && (
                        <div className="cart-item-extras">
                          {item.extras.map((extra) => (
                            <span key={extra} className="cart-extra-tag">{extra}</span>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <p className="cart-item-instructions">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-quantity">
                        <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>
                          <FaPlus />
                        </button>
                      </div>
                      <p className="cart-item-subtotal">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="cart-item-btns">
                        <button className="edit-btn" onClick={() => openEditModal(item)}>
                          <FaEdit />
                        </button>
                        <button className="delete-btn" onClick={() => handleRemove(item._id, item.name)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button className="clear-cart-btn" onClick={handleClear}>
              Clear Cart
            </button>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>৳{cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>৳{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>VAT ({vatRate}%)</span>
              <span>৳{tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>৳{(cartTotal + deliveryFee + tax).toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="customize-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingItem(null)}>
              <FaTimes />
            </button>
            <h3 className="edit-modal-title">Customize: {editingItem.name}</h3>

            <div className="modal-section">
              <h4>Customize Your Order</h4>
              <div className="extras-grid">
                {extraOptions.map((extra) => (
                  <button
                    key={extra}
                    className={`extra-chip ${editExtras.includes(extra) ? "selected" : ""}`}
                    onClick={() => toggleEditExtra(extra)}
                  >
                    {extra}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Special Instructions</h4>
              <textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                placeholder="Any special requests?"
                rows={3}
              />
            </div>

            <button className="modal-add-btn" onClick={saveCustomization}>
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
