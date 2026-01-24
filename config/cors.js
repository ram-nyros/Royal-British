const corsOptions = {
  origin: process.env.ADMIN_URL || true,
  credentials: true,
};

module.exports = corsOptions;
