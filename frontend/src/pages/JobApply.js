import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaBriefcase, FaMapMarkerAlt, FaUtensils, FaMoneyBillWave, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Jobs.css";
import "./Auth.css";
import "./JobApply.css";

const employmentLabels = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const JobApply = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", coverLetter: "", resumeUrl: "" });

  useEffect(() => {
    if (!user) {
      toast.error("Please login to apply");
      navigate("/login");
      return;
    }
    fetchJob();
    setForm((f) => ({ ...f, fullName: user.name || "", email: user.email || "" }));
  }, [user]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(res.data);
    } catch (error) {
      toast.error("Job posting not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/jobs/${id}/apply`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="jobs-loading">Loading...</div>;
  if (!job) return <div className="jobs-empty"><h3>Job posting not found</h3></div>;

  if (submitted) {
    return (
      <div className="jobs-page">
        <div className="job-apply-success">
          <FaPaperPlane className="job-apply-success-icon" />
          <h2>Application Submitted!</h2>
          <p>{job.restaurant?.name} will review your application for {job.title}.</p>
          <Link to="/my-applications" className="job-apply-btn">View My Applications</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="job-apply-card">
        <div className="job-apply-summary">
          <h2><FaBriefcase /> {job.title}</h2>
          <p className="job-restaurant"><FaUtensils /> {job.restaurant?.name}</p>
          <div className="job-meta">
            <span><FaMapMarkerAlt /> {job.location}</span>
            <span className="job-type-badge">{employmentLabels[job.employmentType]}</span>
            {job.salaryRange && <span><FaMoneyBillWave /> {job.salaryRange}</span>}
          </div>
          <p className="job-desc">{job.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="job-apply-form">
          <h3>Your Application</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" required />
          </div>
          <div className="form-group">
            <label>Resume Link (optional)</label>
            <input value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} placeholder="Google Drive, LinkedIn, or portfolio link" />
          </div>
          <div className="form-group">
            <label>Cover Letter</label>
            <textarea
              value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
              placeholder="Tell us why you're a great fit for this role"
              rows={5}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobApply;
