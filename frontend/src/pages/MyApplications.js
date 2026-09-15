import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaBriefcase, FaUtensils } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Jobs.css";
import "./MyApplications.css";

const statusLabels = {
  submitted: "Submitted",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Not Selected",
  hired: "Hired",
};

const statusColors = {
  submitted: "#f39c12",
  reviewed: "#3498db",
  shortlisted: "#9b59b6",
  rejected: "#e74c3c",
  hired: "#27ae60",
};

const MyApplications = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (error) {
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="jobs-loading">Loading...</div>;

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <FaBriefcase className="jobs-header-icon" />
        <h1>My Job Applications</h1>
        <p>Track the status of positions you've applied to</p>
      </div>

      {applications.length === 0 ? (
        <div className="jobs-empty">
          <h3>No applications yet</h3>
          <p>Browse <Link to="/jobs">open positions</Link> at our partner restaurants.</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <div key={app._id} className="application-row">
              <div className="application-info">
                <h4>{app.job?.title || "Position removed"}</h4>
                <p className="job-restaurant">
                  <FaUtensils /> {app.job?.restaurant?.name || "N/A"}
                </p>
                <span className="application-date">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="status-badge" style={{ background: statusColors[app.status] }}>
                {statusLabels[app.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
