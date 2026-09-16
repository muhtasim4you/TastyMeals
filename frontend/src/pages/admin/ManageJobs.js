import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaUsers } from "react-icons/fa";
import toast from "react-hot-toast";
import { API_BASE } from "../../config";
import "./Admin.css";

const employmentLabels = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const ManageJobs = () => {
  const { token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (error) {
      toast.error("Failed to load job postings");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove job posting "${title}"? This also removes its applications.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((j) => j._id !== id));
      toast.success("Job posting removed");
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Job Postings</h1>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Restaurant</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Applicants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td><strong>{job.title}</strong></td>
                <td>
                  <strong>{job.restaurant?.name || "N/A"}</strong>
                  <br />
                  <span className="table-desc">{job.restaurant?.location || ""}</span>
                </td>
                <td><span className="cat-badge">{employmentLabels[job.employmentType]}</span></td>
                <td className="table-desc">{job.location}</td>
                <td>
                  <span className={`role-badge ${job.status === "open" ? "user" : "admin"}`}>
                    {job.status === "open" ? "Open" : "Closed"}
                  </span>
                </td>
                <td><FaUsers /> {job.applicantCount}</td>
                <td>
                  <button className="admin-icon-btn delete" onClick={() => handleDelete(job._id, job.title)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <p className="admin-empty-msg">No job postings from any restaurant yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
