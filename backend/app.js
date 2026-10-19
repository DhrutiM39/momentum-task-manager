const express = require("express");
const cors = require("cors");

const logger = require("./middleware/logger");
const validateContentType = require("./middleware/validateContentType");
const errorHandler = require("./middleware/errorHandler");
const authenticateToken = require("./middleware/authenticateToken");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const { cache, TTL_SECONDS } = require("./cache/taskCache");

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

module.exports = app;
