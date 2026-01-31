const User = require("../models/User");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Helper to validate file
const validateFile = (file, allowedTypes, maxSize = MAX_FILE_SIZE) => {
  if (!file) {
    throw new Error("No file provided");
  }
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
  }
  return true;
};

// Helper to create file object for MongoDB
const createFileObject = (file) => ({
  filename: `${Date.now()}-${file.originalname}`,
  originalName: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  data: file.buffer.toString("base64"),
  uploadedAt: new Date(),
});

// Helper to build dataUrl from file object
const buildDataUrl = (fileObj) => {
  if (!fileObj || !fileObj.mimeType || !fileObj.data) return null;
  return `data:${fileObj.mimeType};base64,${fileObj.data}`;
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log("[UploadController] uploadProfileImage: Starting...");
    console.log("[UploadController] User ID:", req.user._id);

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    validateFile(req.file, ALLOWED_IMAGE_TYPES);

    const fileObject = createFileObject(req.file);
    console.log("[UploadController] File object created:", fileObject.filename);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: fileObject },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[UploadController] Profile image uploaded successfully");
    res.json({
      message: "Profile image uploaded successfully",
      profileImage: {
        filename: user.profileImage.filename,
        originalName: user.profileImage.originalName,
        uploadedAt: user.profileImage.uploadedAt,
      },
    });
  } catch (error) {
    console.error(
      "[UploadController] uploadProfileImage error:",
      error.message,
    );
    res.status(400).json({ message: error.message });
  }
};

// Upload certificate (10th, inter, degree, or other)
exports.uploadCertificate = async (req, res) => {
  try {
    console.log("[UploadController] uploadCertificate: Starting...");
    console.log("[UploadController] User ID:", req.user._id);
    console.log("[UploadController] Certificate type:", req.params.type);

    const { type } = req.params;
    const validTypes = [
      "tenthMarksheet",
      "interCertificate",
      "degreeCertificate",
      "other",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid certificate type. Valid types: ${validTypes.join(", ")}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No certificate file provided" });
    }

    validateFile(req.file, ALLOWED_DOC_TYPES);

    const fileObject = createFileObject(req.file);
    console.log("[UploadController] File object created:", fileObject.filename);

    let updateQuery;
    if (type === "other") {
      updateQuery = {
        $push: { "certificates.otherDocuments": fileObject },
      };
    } else {
      updateQuery = {
        [`certificates.${type}`]: fileObject,
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateQuery, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[UploadController] Certificate uploaded successfully");
    res.json({
      message: "Certificate uploaded successfully",
      type,
    });
  } catch (error) {
    console.error("[UploadController] uploadCertificate error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get file by type and optional fileId
exports.getFile = async (req, res) => {
  try {
    console.log("[UploadController] getFile: Starting...");
    const { type, fileId } = req.params;
    console.log("[UploadController] Type:", type, "FileId:", fileId);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let file = null;

    if (type === "profileImage") {
      file = user.profileImage;
    } else if (type === "other" && fileId) {
      file = user.certificates?.otherDocuments?.find(
        (doc) => doc._id.toString() === fileId,
      );
    } else if (
      ["tenthMarksheet", "interCertificate", "degreeCertificate"].includes(type)
    ) {
      file = user.certificates?.[type];
    }

    if (!file || !file.data) {
      return res.status(404).json({ message: "File not found" });
    }

    const buffer = Buffer.from(file.data, "base64");
    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${file.originalName}"`,
      "Content-Length": buffer.length,
    });

    console.log("[UploadController] File retrieved successfully");
    res.send(buffer);
  } catch (error) {
    console.error("[UploadController] getFile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    console.log("[UploadController] deleteCertificate: Starting...");
    const { type, fileId } = req.params;
    console.log("[UploadController] Type:", type, "FileId:", fileId);

    let updateQuery;

    if (type === "profileImage") {
      updateQuery = { $unset: { profileImage: 1 } };
    } else if (type === "other" && fileId) {
      updateQuery = {
        $pull: { "certificates.otherDocuments": { _id: fileId } },
      };
    } else if (
      ["tenthMarksheet", "interCertificate", "degreeCertificate"].includes(type)
    ) {
      updateQuery = { $unset: { [`certificates.${type}`]: 1 } };
    } else {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateQuery, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[UploadController] File deleted successfully");
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("[UploadController] deleteCertificate error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile with certificates info (includes dataUrl for display)
exports.getProfileWithCertificates = async (req, res) => {
  try {
    console.log("[UploadController] getProfileWithCertificates: Starting...");

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build response with dataUrl for direct display in browser
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage
        ? {
            _id: user.profileImage._id,
            filename: user.profileImage.filename,
            originalName: user.profileImage.originalName,
            mimeType: user.profileImage.mimeType,
            size: user.profileImage.size,
            uploadedAt: user.profileImage.uploadedAt,
            dataUrl: buildDataUrl(user.profileImage),
          }
        : null,
      certificates: {
        tenthMarksheet: user.certificates?.tenthMarksheet
          ? {
              _id: user.certificates.tenthMarksheet._id,
              filename: user.certificates.tenthMarksheet.filename,
              originalName: user.certificates.tenthMarksheet.originalName,
              mimeType: user.certificates.tenthMarksheet.mimeType,
              size: user.certificates.tenthMarksheet.size,
              uploadedAt: user.certificates.tenthMarksheet.uploadedAt,
              dataUrl: buildDataUrl(user.certificates.tenthMarksheet),
            }
          : null,
        interCertificate: user.certificates?.interCertificate
          ? {
              _id: user.certificates.interCertificate._id,
              filename: user.certificates.interCertificate.filename,
              originalName: user.certificates.interCertificate.originalName,
              mimeType: user.certificates.interCertificate.mimeType,
              size: user.certificates.interCertificate.size,
              uploadedAt: user.certificates.interCertificate.uploadedAt,
              dataUrl: buildDataUrl(user.certificates.interCertificate),
            }
          : null,
        degreeCertificate: user.certificates?.degreeCertificate
          ? {
              _id: user.certificates.degreeCertificate._id,
              filename: user.certificates.degreeCertificate.filename,
              originalName: user.certificates.degreeCertificate.originalName,
              mimeType: user.certificates.degreeCertificate.mimeType,
              size: user.certificates.degreeCertificate.size,
              uploadedAt: user.certificates.degreeCertificate.uploadedAt,
              dataUrl: buildDataUrl(user.certificates.degreeCertificate),
            }
          : null,
        otherDocuments:
          user.certificates?.otherDocuments?.map((doc) => ({
            _id: doc._id,
            filename: doc.filename,
            originalName: doc.originalName,
            mimeType: doc.mimeType,
            size: doc.size,
            uploadedAt: doc.uploadedAt,
            dataUrl: buildDataUrl(doc),
          })) || [],
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log("[UploadController] Profile fetched successfully");
    res.json({ user: response });
  } catch (error) {
    console.error(
      "[UploadController] getProfileWithCertificates error:",
      error.message,
    );
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (name, phone, address)
exports.updateProfile = async (req, res) => {
  try {
    console.log("[UploadController] updateProfile: Starting...");
    const { name, phone, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("[UploadController] Profile updated successfully");
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("[UploadController] updateProfile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
