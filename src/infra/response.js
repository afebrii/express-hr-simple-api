function globalResponseHandler(req, res, next) {
  // Format standar untuk response sukses
  res.success = function (message, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message: message || "Request berhasil diproses",
      data: data || null,
    });
  };

  // Format standar untuk response gagal (Opsional, karena sudah ada Global Error Handler)
  res.error = function (message, statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message || "Terjadi kesalahan pada server",
      errors: errors,
    });
  };

  next();
}

module.exports = { globalResponseHandler };
