const express = require("express");
const multer = require("multer");
const router = express.Router();

const uploadController = require("../controllers/upload.controller");
const protect = require("../middleware/auth.middleware");

// Configure multer for memory storage (files will be stored in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// All routes require authentication
router.use(protect);

// Profile routes
router.get("/profile", uploadController.getProfileWithCertificates);
router.put("/profile", uploadController.updateProfile);

// Profile image upload
router.post(
  "/profile-image",
  upload.single("image"),
  uploadController.uploadProfileImage,
);

// Certificate upload routes
// type: tenthMarksheet, interCertificate, degreeCertificate, other
router.post(
  "/certificate/:type",
  upload.single("file"),
  uploadController.uploadCertificate,
);

// Get file (for viewing/downloading)
router.get("/file/:type/:fileId", uploadController.getFile);
router.get("/file/:type", uploadController.getFile);

// Delete file
router.delete("/file/:type/:fileId", uploadController.deleteCertificate);
router.delete("/file/:type", uploadController.deleteCertificate);

module.exports = router;
