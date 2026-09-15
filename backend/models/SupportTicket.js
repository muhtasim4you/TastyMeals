const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "support"], required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    channel: { type: String, enum: ["chat", "email", "phone"], default: "chat" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    messages: [supportMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
