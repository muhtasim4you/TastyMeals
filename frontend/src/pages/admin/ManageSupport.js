import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";
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

const ManageSupport = () => {
  const { token } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (error) {
      toast.error("Failed to load support tickets");
    }
  };

  const filteredTickets = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Support Tickets</h1>

      <div className="admin-filter-bar">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({tickets.length})
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {statusLabels[s]} ({tickets.filter((t) => t.status === s).length})
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Customer</th>
              <th>Channel</th>
              <th>Messages</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((t) => (
              <tr key={t._id}>
                <td><strong>{t.subject}</strong></td>
                <td>
                  <strong>{t.user?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{t.user?.email || ""}</span>
                </td>
                <td><span className="cat-badge">{t.channel}</span></td>
                <td>{t.messages.length}</td>
                <td>
                  <span className="status-badge" style={{ background: statusColors[t.status] }}>
                    {statusLabels[t.status]}
                  </span>
                </td>
                <td className="table-desc">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/support/${t._id}`} className="admin-icon-btn edit">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <p className="admin-empty-msg">No support tickets found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageSupport;
