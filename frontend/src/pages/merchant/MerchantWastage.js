import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaChartBar, FaDollarSign, FaHandHoldingHeart, FaRecycle, FaTrash, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const REASON_LABELS = {
  spoiled: "Spoiled",
  unsold: "Unsold",
  overproduction: "Overproduction",
  quality_issue: "Quality Issue",
  other: "Other",
};

const REASON_COLORS = {
  spoiled: "#e74c3c",
  unsold: "#f39c12",
  overproduction: "#3498db",
  quality_issue: "#9b59b6",
  other: "#e67e22",
};

const ITEM_BAR_COLOR = "#3498db";

const MerchantWastage = () => {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    itemName: "", category: "Main", quantity: "", unit: "portions",
    reason: "unsold", estimatedValue: "", date: "", notes: "",
  });

  const API = "http://localhost:5000/api/merchant/wastage";

  useEffect(() => {
    fetchAnalytics();
    fetchLogs();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(res.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setLogs(res.data);
    } catch (error) {
      toast.error("Failed to load wastage logs");
    }
  };

  const resetForm = () => {
    setForm({
      itemName: "", category: "Main", quantity: "", unit: "portions",
      reason: "unsold", estimatedValue: "", date: "", notes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        quantity: parseFloat(form.quantity),
        estimatedValue: parseFloat(form.estimatedValue) || 0,
        date: form.date ? new Date(form.date).toISOString() : undefined,
      };
      const res = await axios.post(API, data, { headers: { Authorization: `Bearer ${token}` } });
      setLogs([res.data, ...logs]);
      resetForm();
      toast.success("Wastage logged");
      fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log wastage");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (!window.confirm(`Delete wastage entry for "${itemName}"?`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLogs(logs.filter((l) => l._id !== id));
      toast.success("Entry deleted");
      fetchAnalytics();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (!analytics) return <div className="admin-loading">Loading...</div>;

  const maxReasonQty = Math.max(1, ...analytics.byReason.map((r) => r.quantity));
  const maxItemQty = Math.max(1, ...analytics.topItems.map((i) => i.quantity));

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Food Wastage & Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card stat-red">
          <FaTrash className="stat-icon" />
          <div>
            <h3>{analytics.totalQuantity}</h3>
            <p>Total Units Wasted</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <FaDollarSign className="stat-icon" />
          <div>
            <h3>৳{analytics.totalValue.toFixed(2)}</h3>
            <p>Estimated Value Lost</p>
          </div>
        </div>
        <div className="stat-card stat-green">
          <FaHandHoldingHeart className="stat-icon" />
          <div>
            <h3>{analytics.rescuedQuantity}</h3>
            <p>Units Rescued via Donation</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <FaRecycle className="stat-icon" />
          <div>
            <h3>{analytics.diversionRate}%</h3>
            <p>Waste Diversion Rate</p>
          </div>
        </div>
      </div>

      <div className="admin-form-card">
        <h3><FaChartBar /> Wastage by Reason</h3>
        {analytics.totalQuantity === 0 ? (
          <p className="analytics-empty">No wastage logged yet — entries you add below will break down here.</p>
        ) : (
          analytics.byReason.map((r) => (
            <div className="bar-meter-row" key={r.reason}>
              <span className="bar-meter-label">{REASON_LABELS[r.reason]}</span>
              <div className="bar-meter-track">
                <div
                  className="bar-meter-fill"
                  style={{ width: `${(r.quantity / maxReasonQty) * 100}%`, background: REASON_COLORS[r.reason] }}
                />
              </div>
              <span className="bar-meter-value">{r.quantity} units</span>
            </div>
          ))
        )}
      </div>

      <div className="admin-form-card">
        <h3><FaChartBar /> Top Wasted Items</h3>
        {analytics.topItems.length === 0 ? (
          <p className="analytics-empty">No items logged yet.</p>
        ) : (
          analytics.topItems.map((item) => (
            <div className="bar-meter-row" key={item.itemName}>
              <span className="bar-meter-label">{item.itemName}</span>
              <div className="bar-meter-track">
                <div
                  className="bar-meter-fill"
                  style={{ width: `${(item.quantity / maxItemQty) * 100}%`, background: ITEM_BAR_COLOR }}
                />
              </div>
              <span className="bar-meter-value">{item.quantity} units</span>
            </div>
          ))
        )}
      </div>

      <div className="admin-form-card">
        <h3>Log Wastage</h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Item Name</label>
              <input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Main</option>
                <option>Appetizer</option>
                <option>Sides</option>
                <option>Dessert</option>
                <option>Drinks</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Quantity</label>
              <input type="number" step="1" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="portions">Portions</option>
                <option value="kg">Kg</option>
                <option value="pieces">Pieces</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Reason</label>
              <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                {Object.entries(REASON_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Estimated Value Lost (৳)</label>
              <input type="number" step="0.01" min="0" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-save-btn" disabled={saving}>
              <FaPlus /> {saving ? "Logging..." : "Log Wastage"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Value Lost</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>
                  <strong>{log.itemName}</strong>
                  {log.notes && <div className="table-desc">{log.notes}</div>}
                </td>
                <td><span className="cat-badge">{log.category}</span></td>
                <td>{log.quantity} {log.unit}</td>
                <td>
                  <span className="cat-badge" style={{ background: `${REASON_COLORS[log.reason]}22`, color: REASON_COLORS[log.reason] }}>
                    {REASON_LABELS[log.reason]}
                  </span>
                </td>
                <td className="table-price">৳{log.estimatedValue.toFixed(2)}</td>
                <td className="table-desc">{new Date(log.date).toLocaleDateString()}</td>
                <td>
                  <button className="admin-icon-btn delete" onClick={() => handleDelete(log._id, log.itemName)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="admin-empty-msg">No wastage logged yet.</p>
        )}
      </div>
    </div>
  );
};

export default MerchantWastage;
