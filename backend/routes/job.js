const express = require("express");
const auth = require("../middleware/auth");
const JobPosting = require("../models/JobPosting");
const JobApplication = require("../models/JobApplication");

const router = express.Router();

router.get("/my-applications", auth, async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.id })
      .populate({ path: "job", populate: { path: "restaurant", select: "name location image" } })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const jobs = await JobPosting.find({ status: "open" })
      .populate("restaurant", "name location image")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id).populate("restaurant", "name location image");
    if (!job) return res.status(404).json({ message: "Job posting not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/apply", auth, async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job posting not found" });
    if (job.status !== "open") {
      return res.status(400).json({ message: "This position is no longer accepting applications" });
    }

    const { fullName, email, phone, coverLetter, resumeUrl } = req.body;
    if (!fullName || !email || !phone || !coverLetter) {
      return res.status(400).json({ message: "Full name, email, phone, and cover letter are required" });
    }

    const existing = await JobApplication.findOne({ job: job._id, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this position" });
    }

    const application = new JobApplication({
      job: job._id,
      applicant: req.user.id,
      fullName,
      email,
      phone,
      coverLetter,
      resumeUrl: resumeUrl || "",
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
