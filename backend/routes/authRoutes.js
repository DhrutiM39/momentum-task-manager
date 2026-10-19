const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const validateAuthInput = require("../middleware/validateAuthInput");
const {
  register,
  login,
  getCurrentUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", validateAuthInput, register);
router.post("/login", validateAuthInput, login);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;