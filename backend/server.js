
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const logger = require("./middleware/logger");
const validateContentType = require("./middleware/validateContentType");
const errorHandler = require("./middleware/errorHandler");
const authenticateToken = require("./middleware/authenticateToken");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const { cache, TTL_SECONDS } = require("./cache/taskCache");

const PORT = process.env.PORT || 5000;

require("./events/listeners");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(validateContentType);

app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API is running",
    docs: "/api/tasks"
  });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/debug/cache", authenticateToken, (req, res) => {
  const { hits, misses, keys } = cache.getStats();

  res.status(200).json({
    success: true,
    data: { hits, misses, keys, ttlSeconds: TTL_SECONDS }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

// Export the app for automated testing
module.exports = app;

// Start the server only when this file is run directly
if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET must be set in backend/.env");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
}
