const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let status = err.status || 500;

  if (err.name === "ValidationError") {
    status = 400;
  }

  res.status(status).json({
    success: false,
    error: err.message || "Something went wrong"
  });
};

module.exports = errorHandler;