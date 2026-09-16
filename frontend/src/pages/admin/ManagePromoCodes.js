import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";
import "./Admin.css";

const emptyForm = {
  code: "", description: "", discountType: "percentage", discountValue: "",
  maxDiscount: "", minOrderValue: "", expiryDate: "", usageLimit: "", usageLimitPerUser: "1",
  visible: true,
};

const ManagePromoCodes = () => {
  const { token } = useContext(AuthContext);
  const [promos, setPromos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const API = `${API_BASE}/api/admin/promos`;

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setPromos(res.data);
    } catch (error) {
      toast.error("Failed to load promo codes");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const toDateInput = (isoDate) => (isoDate ? new Date(isoDate).toISOString().slice(0, 10) : "");

  const openEdit = (promo) => {
    setForm({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxDiscount: promo.maxDiscount || "",
      minOrderValue: promo.minOrderValue || "",
      expiryDate: toDateInput(promo.expiryDate),
      usageLimit: promo.usageLimit || "",
      usageLimitPerUser: promo.usageLimitPerUser,
      visible: promo.visible,
    });
    setEditing(promo._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      discountValue: parseFloat(form.discountValue),
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      minOrderValue: parseFloat(form.minOrderValue) || 0,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
      usageLimitPerUser: parseInt(form.usageLimitPerUser, 10) || 1,
    };
    try {
      if (editing) {
        const res = await axios.put(`${API}/${editing}`, data, { headers: { Authorization: `Bearer ${token}` } });
        setPromos(promos.map((p) => (p._id === editing ? res.data : p)));
        toast.success("Promo code updated");
      } else {
        const res = await axios.post(API, data, { headers: { Authorization: `Bearer ${token}` } });
        setPromos([res.data, ...promos]);
        toast.success("Promo code created and users notified");
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save promo code");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo) => {
    try {
      const res = await axios.put(`${API}/${promo._id}`, { active: !promo.active }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromos(promos.map((p) => (p._id === promo._id ? res.data : p)));
      toast.success(res.data.active ? "Promo activated" : "Promo deactivated");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete promo code "${code}"?`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPromos(promos.filter((p) => p._id !== id));
      toast.success("Promo code deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Promo Codes</h1>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> New Promo Code
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Edit Promo Code" : "New Promo Code"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. WELCOME20" disabled={!!editing} required />
              </div>
              <div className="admin-form-group">
                <label>Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>{form.discountType === "percentage" ? "Discount (%)" : "Discount (৳)"}</label>
                <input type="number" step="0.01" min="0" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
              </div>
              {form.discountType === "percentage" && (
                <div className="admin-form-group">
                  <label>Max Discount (৳, optional)</label>
                  <input type="number" step="0.01" min="0" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="No cap" />
                </div>
              )}
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Minimum Order Value (৳)</label>
                <input type="number" step="0.01" min="0" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} placeholder="0" />
              </div>
              <div className="admin-form-group">
                <label>Expiry Date (optional)</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Total Usage Limit (optional)</label>
                <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
              </div>
              <div className="admin-form-group">
                <label>Uses Per User</label>
                <input type="number" min="1" value={form.usageLimitPerUser} onChange={(e) => setForm({ ...form, usageLimitPerUser: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="e.g. Welcome discount for new customers" />
            </div>
            <div className="admin-form-group">
              <label>
                <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} style={{ width: "auto", marginRight: 8 }} />
                Show on public Offers page
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-save-btn" disabled={saving}>
                {saving ? "Saving..." : (editing ? "Update" : "Create")} Promo Code
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
              <th>Code</th>
              <th>Discount</th>
              <th>Usage</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p._id}>
                <td>
                  <strong>{p.code}</strong>
                  <br />
                  <span className="table-desc">{p.description}</span>
                </td>
                <td>
                  {p.discountType === "percentage" ? `${p.discountValue}%` : `৳${p.discountValue}`}
                  {p.maxDiscount ? ` (up to ৳${p.maxDiscount})` : ""}
                </td>
                <td>{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                <td className="table-desc">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "No expiry"}</td>
                <td>
                  <span className={`role-badge ${p.active ? "user" : "admin"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn edit" onClick={() => openEdit(p)}><FaEdit /></button>
                    <button className="admin-icon-btn edit" onClick={() => toggleActive(p)}>
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                    <button className="admin-icon-btn delete" onClick={() => handleDelete(p._id, p.code)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && (
          <p className="admin-empty-msg">No promo codes yet. Click "New Promo Code" to create one.</p>
        )}
      </div>
    </div>
  );
};

export default ManagePromoCodes;
