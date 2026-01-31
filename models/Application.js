const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    mobile: String,
    course: String,
    message: String,
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Application", ApplicationSchema);
