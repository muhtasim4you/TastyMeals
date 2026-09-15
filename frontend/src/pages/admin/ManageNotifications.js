import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaTrash, FaBell } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const typeLabels = {
  initiative: "Initiative",
  donation_impact: "Donation Impact",
  deal: "Deal Alert",
  promo: "Promo Code",
};

const ManageNotifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "initiative", image: "" });

  const API = "http://localhost:5000/api/admin/notifications";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(res.data);
    } catch (error) {
      toast.error("Failed to load notifications");
    }
  };

  const resetForm = () => {
    setForm({ title: "", message: "", type: "initiative", image: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(API, form, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications([res.data, ...notifications]);
      toast.success("Notification sent to all users");
      resetForm();
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete notification "${title}"?`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(notifications.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Notifications</h1>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> New Notification
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>Broadcast a Food Wastage Reduction Update</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="initiative">Initiative</option>
                  <option value="donation_impact">Donation Impact</option>
                  <option value="deal">Deal Alert</option>
                  <option value="promo">Promo Code</option>
                </select>
              </div>
            </div>
            <div className="admin-form-group">
              <label>Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} required />
            </div>
            <div className="admin-form-group">
              <label>Image URL (optional)</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-save-btn" disabled={saving}>
                {saving ? "Sending..." : "Send to All Users"}
              </button>
              <button type="button" className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Type</th>
              <th>Sent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n._id}>
                <td><strong>{n.title}</strong></td>
                <td className="table-desc">{n.message}</td>
                <td><span className="cat-badge">{typeLabels[n.type] || n.type}</span></td>
                <td className="table-desc">{new Date(n.createdAt).toLocaleString()}</td>
                <td>
                  <button className="admin-icon-btn delete" onClick={() => handleDelete(n._id, n.title)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length === 0 && (
          <p className="admin-empty-msg">
            <FaBell /> No notifications sent yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageNotifications;
