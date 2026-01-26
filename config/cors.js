const allowedOrigins = (process.env.ADMIN_URL || "")
  .split(",")
  .map((url) => url.trim());

module.exports = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes("*")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
