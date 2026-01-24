const fs = require("fs");
const path = require("path");
const User = require("../models/User");

/**
 * Add a certificate to user
 */
exports.addCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { name, description } = req.body;

    if (!name) {
      // Delete uploaded file if name is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Certificate name is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // Determine file type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = "document";
    if ([".pdf"].includes(ext)) fileType = "pdf";
    if ([".png", ".jpg", ".jpeg"].includes(ext)) fileType = "image";

    // Add certificate
    user.certificates.push({
      name,
      url: req.file.path,
      fileType,
      description: description || "",
    });

    await user.save();
    res.status(201).json({
      message: "Certificate added successfully",
      certificate: user.certificates[user.certificates.length - 1],
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all certificates for user
 */
exports.getCertificates = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("certificates");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Certificates retrieved successfully",
      certificates: user.certificates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific certificate
 */
exports.getCertificateById = async (req, res) => {
  try {
    const { certId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const certificate = user.certificates.id(certId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({
      message: "Certificate retrieved successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update certificate details
 */
exports.updateCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const { name, description } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const certificate = user.certificates.id(certId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (name) certificate.name = name;
    if (description) certificate.description = description;

    await user.save();
    res.json({
      message: "Certificate updated successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete certificate
 */
exports.deleteCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const certificate = user.certificates.id(certId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Delete file from storage
    if (fs.existsSync(certificate.url)) {
      fs.unlinkSync(certificate.url);
    }

    user.certificates.id(certId).deleteOne();
    await user.save();

    res.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
