const VALID_STATUSES = ["pending", "in-progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

const validateTaskInput = (partial = false) => (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ success: false, error: "A JSON object is required" });
  }

  if (!partial && (typeof body.title !== "string" || !body.title.trim())) {
    return res.status(400).json({
      success: false,
      error: "Title is required and must be a non-empty string"
    });
  }

  if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim())) {
    return res.status(400).json({
      success: false,
      error: "Title must be a non-empty string"
    });
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    return res.status(400).json({ success: false, error: "Description must be a string" });
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return res.status(400).json({
      success: false,
      error: `Status must be one of: ${VALID_STATUSES.join(", ")}`
    });
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    return res.status(400).json({
      success: false,
      error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}`
    });
  }

  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    return res.status(400).json({ success: false, error: "Completed must be a boolean" });
  }

  next();
};

module.exports = validateTaskInput;