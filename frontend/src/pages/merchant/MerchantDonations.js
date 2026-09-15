import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaHandHoldingHeart, FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const statusColors = {
  pending: "#f39c12",
  accepted: "#3498db",
  picked_up: "#27ae60",
  cancelled: "#e74c3c",
};
const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

const MerchantDonations = () => {
  const { token } = useContext(AuthContext);
  const [charities, setCharities] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ charityId: "", foodItem: "", quantity: "", unit: "portions", notes: "" });

  const MERCHANT_API = "http://localhost:5000/api/merchant";

  useEffect(() => {
    fetchCharities();
    fetchDonations();
    fetchExpiringItems();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/charities");
      setCharities(res.data);
    } catch (error) {
      toast.error("Failed to load charity partners");
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${MERCHANT_API}/donations`, { headers: { Authorization: `Bearer ${token}` } });
      setDonations(res.data);
    } catch (error) {
      toast.error("Failed to load your donations");
    }
  };

  const fetchExpiringItems = async () => {
    try {
      const res = await axios.get(`${MERCHANT_API}/restaurant`, { headers: { Authorization: `Bearer ${token}` } });
      const now = new Date();
      const items = (res.data.menu || []).filter(
        (item) => item.discountPercentage > 0 && item.expiryDate && new Date(item.expiryDate) > now
      );
      setExpiringItems(items);
    } catch (error) {
      // restaurant fetch failure already surfaced elsewhere; nothing extra to show here
    }
  };

  const useItem = (item) => {
    setForm({ ...form, foodItem: item.name, quantity: form.quantity || "1" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.charityId) {
      toast.error("Please select a charity partner");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`${MERCHANT_API}/donations`, {
        ...form,
        quantity: parseFloat(form.quantity),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setDonations([res.data, ...donations]);
      setForm({ charityId: "", foodItem: "", quantity: "", unit: "portions", notes: "" });
      toast.success("Donation offer sent to charity partner");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit donation");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this donation offer?")) return;
    try {
      const res = await axios.put(`${MERCHANT_API}/donations/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonations(donations.map((d) => (d._id === id ? res.data : d)));
      toast.success("Donation cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Donate Surplus Food</h1>

      {expiringItems.length > 0 && (
        <div className="admin-form-card">
          <h3>Your Items Nearing Expiry</h3>
          <p className="table-desc">Consider donating these instead of letting them go to waste.</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Expires</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expiringItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td><span className="cat-badge">{item.category}</span></td>
                    <td className="table-desc">{new Date(item.expiryDate).toLocaleString()}</td>
                    <td>
                      <button type="button" className="admin-icon-btn edit" onClick={() => useItem(item)}>
                        Use This
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-form-card">
        <h3>New Donation Offer</h3>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Charity Partner</label>
              <select value={form.charityId} onChange={(e) => setForm({ ...form, charityId: e.target.value })} required>
                <option value="">Select a charity...</option>
                {charities.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.location}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Food Item / Description</label>
              <input value={form.foodItem} onChange={(e) => setForm({ ...form, foodItem: e.target.value })} placeholder="e.g. Chicken Biryani" required />
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
          <div className="admin-form-group">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Pickup time, storage details, etc." />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-save-btn" disabled={saving || charities.length === 0}>
              <FaHandHoldingHeart /> {saving ? "Sending..." : "Offer Donation"}
            </button>
          </div>
          {charities.length === 0 && <p className="table-desc">No charity partners are onboarded yet — check back soon.</p>}
        </form>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Charity</th>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d._id}>
                <td>
                  <strong>{d.charity?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc"><FaMapMarkerAlt /> {d.charity?.location || ""}</span>
                </td>
                <td>
                  {d.foodItem}
                  {d.notes && <div className="table-desc">{d.notes}</div>}
                </td>
                <td>{d.quantity} {d.unit}</td>
                <td>
                  <span className="status-badge" style={{ background: statusColors[d.status] }}>
                    {statusLabels[d.status]}
                  </span>
                </td>
                <td className="table-desc">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td>
                  {d.status === "pending" ? (
                    <button className="table-delete-btn" onClick={() => handleCancel(d._id)}>Cancel</button>
                  ) : (
                    <span className="table-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {donations.length === 0 && (
          <p className="admin-empty-msg">No donation offers yet.</p>
        )}
      </div>
    </div>
  );
};

export default MerchantDonations;
