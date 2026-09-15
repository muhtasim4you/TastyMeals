import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Support.css";

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

const SupportTicketPage = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTicket();
  }, [user, id]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/support/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(res.data);
    } catch (error) {
      toast.error("Failed to load ticket");
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/support/${id}/messages`,
        { message: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket(res.data);
      setReply("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!ticket) return <div className="support-page">Loading...</div>;

  return (
    <div className="thread-page">
      <button className="thread-back-btn" onClick={() => navigate("/support")}>
        <FaArrowLeft /> Back to Support
      </button>

      <div className="thread-header">
        <div>
          <h2>{ticket.subject}</h2>
          <span className="thread-header-meta">{ticket.channel} request</span>
        </div>
        <span className="status-badge" style={{ background: statusColors[ticket.status] }}>
          {statusLabels[ticket.status]}
        </span>
      </div>

      <div className="thread-messages">
        {ticket.messages.map((m, i) => (
          <div key={i} className={`thread-message ${m.sender === "user" ? "thread-message-user" : "thread-message-support"}`}>
            <div className="thread-message-sender">{m.sender === "user" ? "You" : m.senderName}</div>
            {m.message}
            <span className="thread-message-time">{new Date(m.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {ticket.status === "closed" ? (
        <p className="thread-closed-note">This ticket is closed. Start a new request from the Support page if you need further help.</p>
      ) : (
        <form className="thread-reply-form" onSubmit={sendReply}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your message..."
            rows={2}
          />
          <button type="submit" className="thread-send-btn" disabled={sending}>
            {sending ? "..." : "Send"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SupportTicketPage;
