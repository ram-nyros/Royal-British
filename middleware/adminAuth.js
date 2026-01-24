const protect = require("./auth.middleware");

module.exports = async (req, res, next) => {
  // Run general auth middleware first
  await protect(req, res, async () => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user.role || req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });
    next();
  });
};
