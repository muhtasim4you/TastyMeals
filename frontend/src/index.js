import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RewardProvider } from "./context/RewardContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <NotificationProvider>
              <RewardProvider>
                <App />
              </RewardProvider>
            </NotificationProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
