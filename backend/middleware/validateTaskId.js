const mongoose = require("mongoose");

const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid task ID format."
    });
  }

  next();
};

module.exports = validateTaskId;