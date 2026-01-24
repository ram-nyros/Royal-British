require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const corsOptions = require("./config/cors");

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/api/applications", require("./routes/applications"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/certificates", require("./routes/certificates"));

// Health
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
