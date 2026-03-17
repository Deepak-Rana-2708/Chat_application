const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    type: { type: String, default: "INVITATION" },
    status: { type: String, enum: ["accepted", "rejected","pending"], default: "pending" },
    isDeleted: {type: Boolean,default: false},
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
