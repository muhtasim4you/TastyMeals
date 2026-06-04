import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaTruck, FaPercent, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const ManageSettings = () => {
  const { token } = useContext(AuthContext);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [vatRate, setVatRate] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000/api/admin/settings";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryFee(res.data.deliveryFee);
      setVatRate(res.data.vatRate);
    } catch (error) {
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        API,
        {
          deliveryFee: parseFloat(deliveryFee),
          vatRate: parseFloat(vatRate),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryFee(res.data.deliveryFee);
      setVatRate(res.data.vatRate);
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Settings</h1>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-icon delivery-icon">
            <FaTruck />
          </div>
          <h3>Delivery Fee</h3>
          <p>Set the delivery charge applied to every order</p>
          <div className="settings-input-wrap">
            <span className="settings-currency">৳</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-icon vat-icon">
            <FaPercent />
          </div>
          <h3>VAT Rate</h3>
          <p>Set the VAT percentage applied to order subtotal</p>
          <div className="settings-input-wrap">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              className="settings-input"
            />
            <span className="settings-percent">%</span>
          </div>
        </div>
      </div>

      <button className="settings-save-btn" onClick={handleSave} disabled={loading}>
        <FaSave /> {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default ManageSettings;
