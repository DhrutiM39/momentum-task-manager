const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const publicUser = (user) => ({
  id: user._id,
  email: user.email
});

exports.register = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ email, password });

    res.status(201).json({
      success: true,
      data: { user: publicUser(user) }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists"
      });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({
        success: false,
        error: "Email or password is incorrect"
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      data: { token, user: publicUser(user) }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ success: false, error: "User no longer exists" });
    }

    res.status(200).json({ success: true, data: publicUser(user) });
  } catch (err) {
    next(err);
  }
};