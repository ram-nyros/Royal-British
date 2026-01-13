require("dotenv").config(); // ✅ MUST be first

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const corsOptions = {
  origin: process.env.ADMIN_URL || true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// 🔍 Debug (remove later)
console.log("Mongo URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/applications", require("./routes/applications"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

// root health check
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
