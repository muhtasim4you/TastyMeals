import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUser, FaPhone, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contact");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "" },
    payment: { cardName: "", cardNumber: "", expiry: "", cvv: "" },
  });

  const API = "http://localhost:5000/api/profile";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || { street: "", city: "", state: "", zip: "" },
        payment: res.data.payment || { cardName: "", cardNumber: "", expiry: "", cvv: "" },
      });
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(API, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone || "",
        address: res.data.address || { street: "", city: "", state: "", zip: "" },
        payment: res.data.payment || { cardName: "", cardNumber: "", expiry: "", cvv: "" },
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (field, value) => {
    setProfile({ ...profile, address: { ...profile.address, [field]: value } });
  };

  const updatePayment = (field, value) => {
    setProfile({ ...profile, payment: { ...profile.payment, [field]: value } });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <FaUser className="avatar-icon" />
            <h3>{profile.name}</h3>
            <p>{profile.email}</p>
          </div>
          <ul className="profile-tabs">
            <li
              className={activeTab === "contact" ? "active" : ""}
              onClick={() => setActiveTab("contact")}
            >
              <FaPhone /> Contact Details
            </li>
            <li
              className={activeTab === "address" ? "active" : ""}
              onClick={() => setActiveTab("address")}
            >
              <FaMapMarkerAlt /> Address
            </li>
            <li
              className={activeTab === "payment" ? "active" : ""}
              onClick={() => setActiveTab("payment")}
            >
              <FaCreditCard /> Payment Info
            </li>
          </ul>
        </div>

        <div className="profile-content">
          {activeTab === "contact" && (
            <div className="profile-section">
              <h2>Contact Details</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile.email} disabled />
                <small>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="profile-section">
              <h2>Delivery Address</h2>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={profile.address.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={profile.address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={profile.address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  value={profile.address.zip}
                  onChange={(e) => updateAddress("zip", e.target.value)}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="profile-section">
              <h2>Payment Information</h2>
              <div className="form-group">
                <label>Name on Card</label>
                <input
                  type="text"
                  value={profile.payment.cardName}
                  onChange={(e) => updatePayment("cardName", e.target.value)}
                  placeholder="Name on card"
                />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  value={profile.payment.cardNumber}
                  onChange={(e) => updatePayment("cardNumber", e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    value={profile.payment.expiry}
                    onChange={(e) => updatePayment("expiry", e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    value={profile.payment.cvv}
                    onChange={(e) => updatePayment("cvv", e.target.value)}
                    placeholder="CVV"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
