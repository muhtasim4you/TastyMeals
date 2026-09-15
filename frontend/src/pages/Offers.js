import { useState, useEffect } from "react";
import axios from "axios";
import { FaTags, FaCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Offers.css";

const Offers = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/promos");
      setPromos(res.data);
    } catch (error) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" — paste it at checkout!`);
  };

  return (
    <div className="offers-page">
      <div className="offers-header">
        <FaTags className="offers-header-icon" />
        <h1>Promotional Offers</h1>
        <p>Apply these codes at checkout for instant savings</p>
      </div>

      {loading ? (
        <div className="offers-loading">Loading...</div>
      ) : promos.length === 0 ? (
        <div className="offers-empty">
          <h3>No active offers right now</h3>
          <p>Check back soon for new promo codes and discounts.</p>
        </div>
      ) : (
        <div className="offers-grid">
          {promos.map((p) => (
            <div key={p._id} className="offer-card">
              <div className="offer-discount">
                {p.discountType === "percentage" ? `${p.discountValue}% OFF` : `৳${p.discountValue} OFF`}
              </div>
              {p.description && <p className="offer-desc">{p.description}</p>}
              <div className="offer-meta">
                {p.minOrderValue > 0 && <span>Min. order ৳{p.minOrderValue}</span>}
                {p.discountType === "percentage" && p.maxDiscount && <span>Up to ৳{p.maxDiscount}</span>}
                {p.expiryDate && <span>Valid till {new Date(p.expiryDate).toLocaleDateString()}</span>}
              </div>
              <button className="offer-code-btn" onClick={() => copyCode(p.code)}>
                <span className="offer-code">{p.code}</span>
                <FaCopy />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
