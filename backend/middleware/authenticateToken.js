const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Provide a Bearer token."
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
    });
  }
};

module.exports = authenticateToken;