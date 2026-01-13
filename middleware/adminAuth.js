const auth = require("./auth");

module.exports = async (req, res, next) => {
  // Run general auth middleware first
  await auth(req, res, async () => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user.role || req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });
    next();
  });
};
