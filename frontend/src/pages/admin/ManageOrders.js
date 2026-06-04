import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Admin.css";

const statusOptions = ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"];
const statusColors = {
  pending: "#f39c12",
  confirmed: "#3498db",
  preparing: "#e67e22",
  on_the_way: "#9b59b6",
  delivered: "#27ae60",
  cancelled: "#e74c3c",
};
const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_the_way: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ManageOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  const API = "http://localhost:5000/api/admin/orders";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (error) {
      toast.error("Failed to load orders");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(
        `${API}/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map((o) => (o._id === orderId ? res.data : o)));
      toast.success(`Order updated to ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Manage Orders</h1>

      <div className="admin-filter-bar">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({orders.length})
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {statusLabels[s]} ({orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="table-mono">#{order._id.slice(-8).toUpperCase()}</td>
                <td>
                  <strong>{order.user?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{order.user?.email || ""}</span>
                </td>
                <td>
                  {order.items.map((item, i) => (
                    <div key={i} className="table-order-item">
                      {item.name} x{item.quantity}
                    </div>
                  ))}
                </td>
                <td className="table-price">৳{order.total.toFixed(2)}</td>
                <td>
                  <span className="payment-badge">{order.payment.method}</span>
                </td>
                <td>
                  <span className="status-badge" style={{ background: statusColors[order.status] }}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="table-desc">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <p className="admin-empty-msg">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
