import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaBriefcase, FaMapMarkerAlt, FaUtensils, FaMoneyBillWave } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Jobs.css";

const employmentLabels = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch (error) {
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <FaBriefcase className="jobs-header-icon" />
        <h1>Careers at Our Partner Restaurants</h1>
        <p>Find your next opportunity with the restaurants you already love</p>
      </div>

      {loading ? (
        <div className="jobs-loading">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="jobs-empty">
          <h3>No open positions right now</h3>
          <p>Check back soon — our partner restaurants post new roles regularly.</p>
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-card-main">
                <h3>{job.title}</h3>
                <p className="job-restaurant">
                  <FaUtensils /> {job.restaurant?.name}
                </p>
                <div className="job-meta">
                  <span><FaMapMarkerAlt /> {job.location}</span>
                  <span className="job-type-badge">{employmentLabels[job.employmentType]}</span>
                  {job.salaryRange && (
                    <span><FaMoneyBillWave /> {job.salaryRange}</span>
                  )}
                </div>
                <p className="job-desc">{job.description}</p>
              </div>
              <Link to={`/jobs/${job._id}/apply`} className="job-apply-btn">
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
