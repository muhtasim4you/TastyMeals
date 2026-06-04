import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaHistory, FaChevronDown, FaChevronUp, FaBoxOpen, FaMobileAlt, FaUniversity } from "react-icons/fa";
import toast from "react-hot-toast";
import "./OrderHistory.css";

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_the_way: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColors = {
  pending: "#f39c12",
  confirmed: "#3498db",
  preparing: "#e67e22",
  on_the_way: "#9b59b6",
  delivered: "#27ae60",
  cancelled: "#e74c3c",
};

const OrderHistory = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const API = "http://localhost:5000/api/orders";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentIcon = (method) => {
    if (method === "bank") return <FaUniversity />;
    return <FaMobileAlt />;
  };

  const getPaymentLabel = (payment) => {
    if (payment.method === "bkash") return `Bkash - ${payment.phoneNumber}`;
    if (payment.method === "nagad") return `Nagad - ${payment.phoneNumber}`;
    if (payment.method === "bank") return `Bank - ${payment.bankName}`;
    return payment.method;
  };

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <FaHistory className="orders-header-icon" />
        <h1>Order History</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <FaBoxOpen className="empty-icon" />
          <h3>No orders yet</h3>
          <p>Your order history will appear here once you place your first order</p>
          <button className="browse-btn" onClick={() => navigate("/")}>
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header" onClick={() => toggleOrder(order._id)}>
                <div className="order-card-left">
                  <span
                    className="order-status"
                    style={{ background: statusColors[order.status] }}
                  >
                    {statusLabels[order.status]}
                  </span>
                  <div className="order-card-info">
                    <h4>Order #{order._id.slice(-8).toUpperCase()}</h4>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="order-card-right">
                  <span className="order-total">${order.total.toFixed(2)}</span>
                  <span className="order-items-count">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </span>
                  {expandedOrder === order._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="order-card-details">
                  <div className="order-detail-section">
                    <h5>Items Ordered</h5>
                    <div className="order-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-detail-item">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="order-item-img" />
                          )}
                          <div className="order-item-info">
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-restaurant">{item.restaurant}</span>
                            {item.extras && item.extras.length > 0 && (
                              <div className="order-item-extras">
                                {item.extras.map((extra, i) => (
                                  <span key={i} className="order-extra-tag">{extra}</span>
                                ))}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <span className="order-item-note">"{item.specialInstructions}"</span>
                            )}
                          </div>
                          <div className="order-item-qty">
                            <span>x{item.quantity}</span>
                            <span className="order-item-price">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-detail-grid">
                    <div className="order-detail-section">
                      <h5>Delivery Address</h5>
                      <p>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state} {order.deliveryAddress.zip}
                      </p>
                      {order.note && <p className="order-note">Note: {order.note}</p>}
                    </div>

                    <div className="order-detail-section">
                      <h5>Payment</h5>
                      <div className="order-payment-info">
                        {getPaymentIcon(order.payment.method)}
                        <span>{getPaymentLabel(order.payment)}</span>
                      </div>
                      {order.payment.transactionId && (
                        <p className="order-txn">TXN: {order.payment.transactionId}</p>
                      )}
                    </div>
                  </div>

                  <div className="order-detail-section order-pricing">
                    <div className="pricing-row">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="pricing-row">
                      <span>Delivery Fee</span>
                      <span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="pricing-row">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="pricing-divider"></div>
                    <div className="pricing-row pricing-total">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
