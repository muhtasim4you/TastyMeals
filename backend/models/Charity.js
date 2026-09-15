const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: { type: String, required: true },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Charity", charitySchema);
