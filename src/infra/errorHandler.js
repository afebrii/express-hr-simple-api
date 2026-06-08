function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Stack trace hanya ditampilkan saat mode development agar aman
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = { globalErrorHandler };
