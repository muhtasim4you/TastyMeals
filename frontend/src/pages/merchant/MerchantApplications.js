import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaArrowLeft, FaEnvelope, FaPhone, FaFileAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";
import "../admin/Admin.css";

const statusOptions = ["submitted", "reviewed", "shortlisted", "rejected", "hired"];
const statusColors = {
  submitted: "#f39c12",
  reviewed: "#3498db",
  shortlisted: "#9b59b6",
  rejected: "#e74c3c",
  hired: "#27ae60",
};
const statusLabels = {
  submitted: "Submitted",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Not Selected",
  hired: "Hired",
};

const MerchantApplications = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/merchant/jobs/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(res.data.job);
      setApplications(res.data.applications);
    } catch (error) {
      toast.error("Failed to load applications");
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/merchant/applications/${applicationId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(applications.map((a) => (a._id === applicationId ? res.data : a)));
      toast.success(`Marked as ${statusLabels[status]}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (!job) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <button className="admin-back-btn" onClick={() => navigate("/merchant/jobs")}>
            <FaArrowLeft /> Back
          </button>
          <h1 className="admin-page-title">{job.title} — Applicants</h1>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Contact</th>
              <th>Cover Letter</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td><strong>{app.fullName}</strong></td>
                <td>
                  <div className="table-desc"><FaEnvelope /> {app.email}</div>
                  <div className="table-desc"><FaPhone /> {app.phone}</div>
                </td>
                <td className="table-desc">{app.coverLetter}</td>
                <td>
                  {app.resumeUrl ? (
                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="admin-icon-btn edit">
                      <FaFileAlt /> View
                    </a>
                  ) : (
                    <span className="table-muted">-</span>
                  )}
                </td>
                <td>
                  <span className="status-badge" style={{ background: statusColors[app.status] }}>
                    {statusLabels[app.status]}
                  </span>
                </td>
                <td className="table-desc">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    className="status-select"
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
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
        {applications.length === 0 && (
          <p className="admin-empty-msg">No applications yet for this position.</p>
        )}
      </div>
    </div>
  );
};

export default MerchantApplications;
