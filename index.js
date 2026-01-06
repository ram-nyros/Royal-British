require("dotenv").config(); // ✅ MUST be first

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// 🔍 Debug (remove later)
console.log("Mongo URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/applications", require("./routes/applications"));

app.listen(5000, () => console.log("Server running on port 5000"));
