const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app");

require("./events/listeners");

const PORT = process.env.PORT || 5000;

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
