const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  deliveryFee: { type: Number, default: 30 },
  vatRate: { type: Number, default: 5 },
});

module.exports = mongoose.model("Settings", settingsSchema);
