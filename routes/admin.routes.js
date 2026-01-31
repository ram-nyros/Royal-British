const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const adminAuth = require("../middleware/admin.middleware");

// Auth routes (no middleware needed for login)
router.post("/login", adminController.login);

// Protected routes (require admin auth)
router.get("/me", adminAuth, adminController.getMe);
router.get("/dashboard", adminAuth, adminController.getDashboardStats);

// User management
router.get("/users", adminAuth, adminController.getUsers);
router.get("/users/:id", adminAuth, adminController.getUserById);
router.delete("/users/:id", adminAuth, adminController.deleteUser);

// Application management
router.get("/applications", adminAuth, adminController.getApplications);
router.get("/applications/:id", adminAuth, adminController.getApplicationById);
router.patch(
  "/applications/:id/status",
  adminAuth,
  adminController.updateApplicationStatus,
);
router.delete(
  "/applications/:id",
  adminAuth,
  adminController.deleteApplication,
);

module.exports = router;
