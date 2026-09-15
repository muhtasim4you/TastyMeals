import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { FaBell, FaLeaf, FaHandHoldingHeart, FaFire, FaTag } from "react-icons/fa";
import "./Notifications.css";

const typeIcons = {
  initiative: FaLeaf,
  donation_impact: FaHandHoldingHeart,
  deal: FaFire,
  promo: FaTag,
};

const timeAgo = (dateString) => {
  const diffMs = new Date() - new Date(dateString);
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <FaBell className="notifications-header-icon" />
        <h1>Food Wastage Reduction Updates</h1>
        <p>Programs, initiatives, and impact stories from the TastyMeals community</p>
        {unreadCount > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <h3>No notifications yet</h3>
          <p>We'll let you know when there's a new initiative or impact story to share.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || FaBell;
            return (
              <div
                key={n._id}
                className={`notification-card ${n.read ? "" : "unread"}`}
                onClick={() => !n.read && markAsRead(n._id)}
              >
                <div className={`notification-icon ${n.type}`}>
                  <Icon />
                </div>
                <div className="notification-body">
                  <div className="notification-top">
                    <h4>{n.title}</h4>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p>{n.message}</p>
                </div>
                {!n.read && <span className="unread-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
