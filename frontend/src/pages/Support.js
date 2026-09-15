import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaHeadset, FaComments, FaEnvelope, FaPhoneAlt, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Support.css";

const SUPPORT_EMAIL = "support@tastymeals.com";
const SUPPORT_PHONE = "+880 1700-000000";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const statusColors = {
  open: "#f39c12",
  in_progress: "#3498db",
  resolved: "#27ae60",
  closed: "#999",
};

const Support = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", channel: "chat" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (error) {
      toast.error("Failed to load your support tickets");
    }
  };

  const openForm = (channel) => {
    setForm({ subject: "", message: "", channel });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/api/support", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets([res.data, ...tickets]);
      setShowForm(false);
      toast.success("Your request has been sent to our support team");
      navigate(`/support/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-header">
        <FaHeadset className="support-header-icon" />
        <h1>Customer Support</h1>
        <p>Reach us however works best for you — we're here to help</p>
      </div>

      <div className="support-channels">
        <div className="support-channel-card">
          <FaComments className="support-channel-icon channel-chat" />
          <h3>Live Chat</h3>
          <p>Start a conversation with our support team right here in the app.</p>
          <button className="support-channel-btn" onClick={() => openForm("chat")}>Start Chat</button>
        </div>
        <div className="support-channel-card">
          <FaEnvelope className="support-channel-icon channel-email" />
          <h3>Email</h3>
          <p>Prefer email? Reach us at <strong>{SUPPORT_EMAIL}</strong></p>
          <a className="support-channel-btn" href={`mailto:${SUPPORT_EMAIL}`}>Open Email</a>
          <button className="support-channel-link" onClick={() => openForm("email")}>or send via the app</button>
        </div>
        <div className="support-channel-card">
          <FaPhoneAlt className="support-channel-icon channel-phone" />
          <h3>Phone</h3>
          <p>Call us directly at <strong>{SUPPORT_PHONE}</strong></p>
          <a className="support-channel-btn" href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}>Call Now</a>
          <button className="support-channel-link" onClick={() => openForm("phone")}>or request a callback</button>
        </div>
      </div>

      {showForm && (
        <div className="support-form-card">
          <h3>New Support Request ({form.channel === "phone" ? "Callback Request" : form.channel.charAt(0).toUpperCase() + form.channel.slice(1)})</h3>
          <form onSubmit={handleSubmit}>
            <div className="support-form-group">
              <label>Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What do you need help with?" required />
            </div>
            <div className="support-form-group">
              <label>Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={form.channel === "phone" ? "Let us know when's a good time to call and what it's about" : "Describe your issue in detail"}
                rows={4}
                required
              />
            </div>
            <div className="support-form-actions">
              <button type="submit" className="support-submit-btn" disabled={submitting}>
                {submitting ? "Sending..." : "Send Request"}
              </button>
              <button type="button" className="support-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="support-tickets">
        <h3>My Support Requests</h3>
        {tickets.length === 0 ? (
          <p className="support-empty">No support requests yet. Use one of the channels above if you need help.</p>
        ) : (
          <div className="support-ticket-list">
            {tickets.map((t) => (
              <Link key={t._id} to={`/support/${t._id}`} className="support-ticket-row">
                <div>
                  <h4>{t.subject}</h4>
                  <span className="support-ticket-meta">
                    {t.channel} · {new Date(t.createdAt).toLocaleDateString()} · {t.messages.length} message{t.messages.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="status-badge" style={{ background: statusColors[t.status] }}>
                  {statusLabels[t.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
