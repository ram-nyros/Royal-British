require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const corsOptions = require("./config/cors");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
