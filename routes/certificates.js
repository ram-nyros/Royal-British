const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware.js");
const upload = require("../middleware/multerConfig");
const {
  addCertificate,
  getCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
} = require("../controllers/certificatesController");

/**
 * POST /api/certificates - Add new certificate
 * Requires: auth, file upload, name, optional description
 */
router.post("/", auth, upload.single("file"), addCertificate);

/**
 * GET /api/certificates - Get all user certificates
 */
router.get("/", auth, getCertificates);

/**
 * GET /api/certificates/:certId - Get specific certificate
 */
router.get("/:certId", auth, getCertificateById);

/**
 * PATCH /api/certificates/:certId - Update certificate details
 */
router.patch("/:certId", auth, updateCertificate);

/**
 * DELETE /api/certificates/:certId - Delete certificate
 */
router.delete("/:certId", auth, deleteCertificate);

module.exports = router;
