const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: "A valid email address is required"
    });
  }

  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    return res.status(400).json({
      success: false,
      error: "Password must be between 8 and 72 characters"
    });
  }

  next();
};

module.exports = validateAuthInput;