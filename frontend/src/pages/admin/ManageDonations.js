import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Admin.css";

const statusOptions = ["pending", "accepted", "picked_up", "cancelled"];
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

const ManageDonations = () => {
  const { token } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState("all");

  const API = "http://localhost:5000/api/admin/donations";

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setDonations(res.data);
    } catch (error) {
      toast.error("Failed to load donations");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `${API}/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDonations(donations.map((d) => (d._id === id ? res.data : d)));
      toast.success(`Donation updated to ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredDonations = filter === "all" ? donations : donations.filter((d) => d.status === filter);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Surplus Food Donations</h1>

      <div className="admin-filter-bar">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({donations.length})
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {statusLabels[s]} ({donations.filter((d) => d.status === s).length})
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Charity</th>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonations.map((donation) => (
              <tr key={donation._id}>
                <td>
                  <strong>{donation.restaurant?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{donation.restaurant?.location || ""}</span>
                </td>
                <td>
                  <strong>{donation.charity?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{donation.charity?.location || ""}</span>
                </td>
                <td>
                  {donation.foodItem}
                  {donation.notes && <div className="table-desc">{donation.notes}</div>}
                </td>
                <td>{donation.quantity} {donation.unit}</td>
                <td>
                  <span className="status-badge" style={{ background: statusColors[donation.status] }}>
                    {statusLabels[donation.status]}
                  </span>
                </td>
                <td className="table-desc">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <select
                    className="status-select"
                    value={donation.status}
                    onChange={(e) => handleStatusChange(donation._id, e.target.value)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDonations.length === 0 && (
          <p className="admin-empty-msg">No donations found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageDonations;
