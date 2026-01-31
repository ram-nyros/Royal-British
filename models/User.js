const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Schema for storing file metadata (files stored as base64 in MongoDB)
const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: String, required: true }, // base64 encoded file data
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "user" },

    // Profile image
    profileImage: fileSchema,

    // Phone number
    phone: { type: String },

    // Address fields
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    is_admin: { type: Boolean, default: false },

    // Certificates (10th marksheet, inter certificates, etc.)
    certificates: {
      tenthMarksheet: fileSchema,
      interCertificate: fileSchema,
      degreeCertificate: fileSchema,
      otherDocuments: [fileSchema],
    },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
