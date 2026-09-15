import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaDollarSign } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Admin.css";

const REASON_LABELS = {
  spoiled: "Spoiled",
  unsold: "Unsold",
  overproduction: "Overproduction",
  quality_issue: "Quality Issue",
  other: "Other",
};

const REASON_COLORS = {
  spoiled: "#e74c3c",
  unsold: "#f39c12",
  overproduction: "#3498db",
  quality_issue: "#9b59b6",
  other: "#e67e22",
};

const ManageWastage = () => {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/wastage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (error) {
      toast.error("Failed to load wastage logs");
    }
  };

  const totalQuantity = logs.reduce((sum, l) => sum + l.quantity, 0);
  const totalValue = logs.reduce((sum, l) => sum + l.estimatedValue, 0);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Food Wastage Overview</h1>

      <div className="stats-grid">
        <div className="stat-card stat-red">
          <FaTrash className="stat-icon" />
          <div>
            <h3>{totalQuantity}</h3>
            <p>Total Units Wasted (all restaurants)</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <FaDollarSign className="stat-icon" />
          <div>
            <h3>৳{totalValue.toFixed(2)}</h3>
            <p>Total Estimated Value Lost</p>
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Value Lost</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>
                  <strong>{log.restaurant?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{log.restaurant?.location || ""}</span>
                </td>
                <td>{log.itemName}</td>
                <td>{log.quantity} {log.unit}</td>
                <td>
                  <span className="cat-badge" style={{ background: `${REASON_COLORS[log.reason]}22`, color: REASON_COLORS[log.reason] }}>
                    {REASON_LABELS[log.reason]}
                  </span>
                </td>
                <td className="table-price">৳{log.estimatedValue.toFixed(2)}</td>
                <td className="table-desc">{new Date(log.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="admin-empty-msg">No wastage logged by any restaurant yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageWastage;
