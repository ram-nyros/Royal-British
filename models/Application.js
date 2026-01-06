const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    mobile: String,
    course: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
