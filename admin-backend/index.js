const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const adminRoutes = require("./routes/admin/admin");
const userRoutes = require("./routes/admin/users");
const llmRoutes = require("./routes/llms");
const promptRoutes = require("./routes/prompts");


const app = express();

// Use port from .env or fallback
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (clean version – no deprecated options)
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/llms", llmRoutes);
app.use("/prompts", promptRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
