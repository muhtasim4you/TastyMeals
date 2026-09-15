import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const statusOptions = ["open", "in_progress", "resolved", "closed"];
const statusColors = {
  open: "#f39c12",
  in_progress: "#3498db",
  resolved: "#27ae60",
  closed: "#999",
};
const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const AdminSupportTicket = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/support/${id}`, {
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
        `http://localhost:5000/api/admin/support/${id}/messages`,
        { message: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket(res.data);
      setReply("");
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/support/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicket(res.data);
      toast.success(`Ticket marked as ${statusLabels[status]}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (!ticket) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <button className="admin-back-btn" onClick={() => navigate("/admin/support")}>
        <FaArrowLeft /> Back
      </button>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{ticket.subject}</h1>
          <p className="table-desc">
            {ticket.user?.name} ({ticket.user?.email}) · {ticket.channel} request
          </p>
        </div>
        <select
          className="status-select"
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      <div className="admin-form-card">
        <div className="thread-messages">
          {ticket.messages.map((m, i) => (
            <div key={i} className={`thread-message ${m.sender === "support" ? "thread-message-user" : "thread-message-support"}`}>
              <div className="thread-message-sender">{m.sender === "user" ? ticket.user?.name : m.senderName}</div>
              {m.message}
              <span className="thread-message-time">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <form className="thread-reply-form" onSubmit={sendReply}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            rows={2}
          />
          <button type="submit" className="thread-send-btn" disabled={sending}>
            {sending ? "..." : "Reply"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSupportTicket;
