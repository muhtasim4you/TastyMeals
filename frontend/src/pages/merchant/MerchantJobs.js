import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaUsers } from "react-icons/fa";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const employmentLabels = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const MerchantJobs = () => {
  const { token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", location: "", employmentType: "full_time", salaryRange: "",
  });

  const API = "http://localhost:5000/api/merchant/jobs";

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(res.data);
    } catch (error) {
      toast.error("Failed to load job postings");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", location: "", employmentType: "full_time", salaryRange: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (job) => {
    setForm({
      title: job.title, description: job.description, location: job.location,
      employmentType: job.employmentType, salaryRange: job.salaryRange,
    });
    setEditing(job._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await axios.put(`${API}/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } });
        setJobs(jobs.map((j) => (j._id === editing ? { ...res.data, applicantCount: j.applicantCount } : j)));
        toast.success("Job posting updated");
      } else {
        const res = await axios.post(API, form, { headers: { Authorization: `Bearer ${token}` } });
        setJobs([{ ...res.data, applicantCount: 0 }, ...jobs]);
        toast.success("Job posting created");
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save job posting");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (job) => {
    try {
      const newStatus = job.status === "open" ? "closed" : "open";
      const res = await axios.put(`${API}/${job._id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(jobs.map((j) => (j._id === job._id ? { ...res.data, applicantCount: j.applicantCount } : j)));
      toast.success(`Position marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All applications for it will also be removed.`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs(jobs.filter((j) => j._id !== id));
      toast.success("Job posting deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Job Postings</h1>
        <button className="admin-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> New Job Posting
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? "Edit Job Posting" : "New Job Posting"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Job Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Line Cook" required />
              </div>
              <div className="admin-form-group">
                <label>Employment Type</label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                  {Object.entries(employmentLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Salary Range (optional)</label>
                <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} placeholder="e.g. ৳15,000 - ৳20,000/month" />
              </div>
            </div>
            <div className="admin-form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required />
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-save-btn" disabled={saving}>
                {saving ? "Saving..." : (editing ? "Update" : "Post")} Job
              </button>
              <button type="button" className="admin-cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
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
                <td><span className="cat-badge">{employmentLabels[job.employmentType]}</span></td>
                <td className="table-desc">{job.location}</td>
                <td>
                  <span className={`role-badge ${job.status === "open" ? "user" : "admin"}`}>
                    {job.status === "open" ? "Open" : "Closed"}
                  </span>
                </td>
                <td>
                  <Link to={`/merchant/jobs/${job._id}/applications`} className="admin-icon-btn edit">
                    <FaUsers /> {job.applicantCount}
                  </Link>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="admin-icon-btn edit" onClick={() => openEdit(job)}><FaEdit /></button>
                    <button className="admin-icon-btn edit" onClick={() => toggleStatus(job)}>
                      {job.status === "open" ? "Close" : "Reopen"}
                    </button>
                    <button className="admin-icon-btn delete" onClick={() => handleDelete(job._id, job.title)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <p className="admin-empty-msg">No job postings yet. Click "New Job Posting" to hire for your restaurant.</p>
        )}
      </div>
    </div>
  );
};

export default MerchantJobs;
