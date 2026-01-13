const express = require("express");
const router = express.Router();
const adminOnly = require("../middleware/adminAuth");
const usersCtrl = require("../controllers/admin/usersController");
const appsCtrl = require("../controllers/admin/applicationsController");

// All admin routes require admin access
router.use(adminOnly);

// Users
router.get("/users", usersCtrl.list);
router.get("/users/:id", usersCtrl.get);
router.put("/users/:id/role", usersCtrl.updateRole);
router.delete("/users/:id", usersCtrl.remove);

// Applications
router.get("/applications", appsCtrl.list);
router.get("/applications/:id", appsCtrl.get);
router.delete("/applications/:id", appsCtrl.delete);

module.exports = router;
