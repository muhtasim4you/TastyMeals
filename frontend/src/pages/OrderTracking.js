import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  FaCheckCircle,
  FaUtensils,
  FaTruck,
  FaBoxOpen,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "./OrderTracking.css";

const statusSteps = [
  { key: "confirmed", label: "Confirmed", icon: <FaCheckCircle />, color: "#3498db" },
  { key: "preparing", label: "Preparing", icon: <FaUtensils />, color: "#e67e22" },
  { key: "on_the_way", label: "On the Way", icon: <FaTruck />, color: "#9b59b6" },
  { key: "delivered", label: "Delivered", icon: <FaBoxOpen />, color: "#27ae60" },
];

const OrderTracking = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api/orders";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (error) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedTime = () => {
    if (!order || !order.estimatedDelivery) return null;
    const now = new Date();
    const est = new Date(order.estimatedDelivery);
    const diff = est - now;
    if (diff <= 0) return "Arriving now";
    const mins = Math.ceil(diff / 60000);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hrs}h ${remainMins}m`;
    }
    return `${mins} min`;
  };

  const getProgressPercent = () => {
    if (!order) return 0;
    const idx = statusSteps.findIndex((s) => s.key === order.status);
    if (idx === -1) return 0;
    return ((idx + 1) / statusSteps.length) * 100;
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="tracking-loading">Loading order...</div>;
  }

  if (!order) {
    return <div className="tracking-loading">Order not found</div>;
  }

  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="tracking-page">
      <div className="tracking-card">
        <div className="tracking-header">
          <div>
            <h1>Track Your Order</h1>
            <p className="tracking-order-id">
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          {!isDelivered && !isCancelled && (
            <div className="tracking-eta">
              <FaClock className="eta-icon" />
              <div>
                <span className="eta-label">Estimated Delivery</span>
                <span className="eta-time">{getEstimatedTime()}</span>
              </div>
            </div>
          )}
          {isDelivered && (
            <div className="tracking-eta delivered-eta">
              <FaCheckCircle className="eta-icon" />
              <div>
                <span className="eta-label">Status</span>
                <span className="eta-time">Delivered</span>
              </div>
            </div>
          )}
        </div>

        <div className="tracking-progress-bar">
          <div
            className="tracking-progress-fill"
            style={{ width: `${getProgressPercent()}%` }}
          ></div>
        </div>

        <div className="tracking-steps">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const historyEntry = order.statusHistory?.find((h) => h.status === step.key);

            return (
              <div
                key={step.key}
                className={`tracking-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
              >
                <div
                  className="step-icon-circle"
                  style={{
                    background: isCompleted ? step.color : "#eee",
                    color: isCompleted ? "#fff" : "#ccc",
                  }}
                >
                  {step.icon}
                </div>
                <div className="step-info">
                  <h4>{step.label}</h4>
                  {historyEntry ? (
                    <>
                      <p className="step-message">{historyEntry.message}</p>
                      <p className="step-time">{formatTime(historyEntry.time)}</p>
                    </>
                  ) : (
                    <p className="step-pending">Pending</p>
                  )}
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`step-connector ${idx < currentStepIdx ? "active" : ""}`}></div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      <div className="tracking-details">
        <div className="tracking-detail-card">
          <h3>Order Summary</h3>
          <div className="tracking-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="tracking-item">
                {item.image && <img src={item.image} alt={item.name} />}
                <div className="tracking-item-info">
                  <span className="tracking-item-name">{item.name}</span>
                  <span className="tracking-item-restaurant">{item.restaurant}</span>
                </div>
                <div className="tracking-item-qty">
                  <span>x{item.quantity}</span>
                  <span className="tracking-item-price">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="tracking-total">
            <span>Total</span>
            <span>৳{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="tracking-detail-card">
          <h3>Delivery Details</h3>
          <div className="tracking-address">
            <FaMapMarkerAlt className="address-icon" />
            <div>
              <p>{order.deliveryAddress.street}</p>
              <p>
                {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                {order.deliveryAddress.zip}
              </p>
            </div>
          </div>
          {order.estimatedDelivery && (
            <div className="tracking-est-delivery">
              <FaClock />
              <span>Estimated: {formatDate(order.estimatedDelivery)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
