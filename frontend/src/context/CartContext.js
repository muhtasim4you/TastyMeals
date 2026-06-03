import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });

  const API = "http://localhost:5000/api/cart";

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (error) {
      console.error("Failed to fetch cart");
    }
  };

  const addToCart = async (item) => {
    try {
      const res = await axios.post(`${API}/add`, item, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
      return true;
    } catch (error) {
      console.error("Failed to add to cart");
      return false;
    }
  };

  const updateCartItem = async (cartItemId, updates) => {
    try {
      const res = await axios.put(`${API}/update/${cartItemId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (error) {
      console.error("Failed to update cart item");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await axios.delete(`${API}/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (error) {
      console.error("Failed to remove from cart");
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete(`${API}/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (error) {
      console.error("Failed to clear cart");
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
