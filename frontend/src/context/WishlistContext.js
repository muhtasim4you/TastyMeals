import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState({ restaurants: [], items: [] });

  const API = "http://localhost:5000/api/wishlist";

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setWishlist({ restaurants: [], items: [] });
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
    } catch (error) {
      console.error("Failed to fetch wishlist");
    }
  };

  const toggleRestaurant = async (restaurant) => {
    try {
      const res = await axios.post(`${API}/restaurant`, restaurant, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
    } catch (error) {
      console.error("Failed to toggle restaurant");
    }
  };

  const toggleItem = async (item) => {
    try {
      const res = await axios.post(`${API}/item`, item, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
    } catch (error) {
      console.error("Failed to toggle item");
    }
  };

  const removeRestaurant = async (restaurantId) => {
    try {
      const res = await axios.delete(`${API}/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
    } catch (error) {
      console.error("Failed to remove restaurant");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await axios.delete(`${API}/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
    } catch (error) {
      console.error("Failed to remove item");
    }
  };

  const isRestaurantFav = (restaurantId) => {
    return wishlist.restaurants.some((r) => r.restaurantId === restaurantId);
  };

  const isItemFav = (name, restaurant) => {
    return wishlist.items.some((i) => i.name === name && i.restaurant === restaurant);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleRestaurant,
        toggleItem,
        removeRestaurant,
        removeItem,
        isRestaurantFav,
        isItemFav,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
