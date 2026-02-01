const User = require("../models/User");
const Application = require("../models/Application");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Helper to build dataUrl from file object
const buildDataUrl = (fileObj) => {
  if (!fileObj || !fileObj.mimeType || !fileObj.data) return null;
  return `data:${fileObj.mimeType};base64,${fileObj.data}`;
};

// Helper to build user with all dataUrls
const buildUserWithDataUrls = (user) => {
  return {
    ...user,
    profileImage: user.profileImage
      ? {
          ...user.profileImage,
          dataUrl: buildDataUrl(user.profileImage),
        }
      : null,
    certificates: {
      tenthMarksheet: user.certificates?.tenthMarksheet
        ? {
            ...user.certificates.tenthMarksheet,
            dataUrl: buildDataUrl(user.certificates.tenthMarksheet),
          }
        : null,
      interCertificate: user.certificates?.interCertificate
        ? {
            ...user.certificates.interCertificate,
            dataUrl: buildDataUrl(user.certificates.interCertificate),
          }
        : null,
      degreeCertificate: user.certificates?.degreeCertificate
        ? {
            ...user.certificates.degreeCertificate,
            dataUrl: buildDataUrl(user.certificates.degreeCertificate),
          }
        : null,
      otherDocuments: (user.certificates?.otherDocuments || []).map((doc) => ({
        ...doc,
        dataUrl: buildDataUrl(doc),
      })),
    },
  };
};

// Admin Login
exports.login = async (req, res) => {
  try {
    console.log("[AdminController] Admin login attempt:", req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("[AdminController] User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is admin
    if (!user.is_admin) {
      console.log("[AdminController] User is not admin:", email);
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("[AdminController] Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    console.log("[AdminController] Admin login successful:", email);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error("[AdminController] Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current admin user
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        is_admin: req.user.is_admin,
      },
    });
  } catch (error) {
    console.error("[AdminController] getMe error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("[AdminController] Getting dashboard stats");

    const totalUsers = await User.countDocuments({ is_admin: { $ne: true } });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({
      status: "pending",
    });
    const approvedApplications = await Application.countDocuments({
      status: "approved",
    });
    const rejectedApplications = await Application.countDocuments({
      status: "rejected",
    });

    // Recent activity
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentUsers = await User.find({ is_admin: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt")
      .lean();

    res.json({
      stats: {
        totalUsers,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
      },
      recentApplications,
      recentUsers,
    });
  } catch (error) {
    console.error("[AdminController] getDashboardStats error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users with pagination and search
exports.getUsers = async (req, res) => {
  try {
    console.log("[AdminController] Getting users list");
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = { is_admin: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-password")
      .lean();

    // Add dataUrl for profile images and certificates
    const usersWithDataUrl = users.map(buildUserWithDataUrls);

    res.json({
      users: usersWithDataUrl,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[AdminController] getUsers error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    console.log("[AdminController] Getting user by ID:", req.params.id);
    const user = await User.findById(req.params.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build response with all dataUrls
    const response = buildUserWithDataUrls(user);

    res.json({ user: response });
  } catch (error) {
    console.error("[AdminController] getUserById error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    console.log("[AdminController] Deleting user:", req.params.id);
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.is_admin) {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }

    await User.findByIdAndDelete(req.params.id);
    console.log("[AdminController] User deleted successfully");
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[AdminController] deleteUser error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all applications with pagination and search
exports.getApplications = async (req, res) => {
  try {
    console.log("[AdminController] Getting applications list");
    const { page = 1, limit = 10, search = "", status = "all" } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[AdminController] getApplications error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    console.log("[AdminController] Getting application by ID:", req.params.id);
    const application = await Application.findById(req.params.id).lean();

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ application });
  } catch (error) {
    console.error("[AdminController] getApplicationById error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    console.log(
      "[AdminController] Updating application status:",
      req.params.id,
    );
    const { status } = req.body;

    if (
      !status ||
      !["pending", "reviewed", "approved", "rejected"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).lean();

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    console.log("[AdminController] Application status updated to:", status);
    res.json({ application, message: "Application status updated" });
  } catch (error) {
    console.error(
      "[AdminController] updateApplicationStatus error:",
      error.message,
    );
    res.status(500).json({ message: "Server error" });
  }
};

// Delete application
exports.deleteApplication = async (req, res) => {
  try {
    console.log("[AdminController] Deleting application:", req.params.id);
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    console.log("[AdminController] Application deleted successfully");
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("[AdminController] deleteApplication error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
