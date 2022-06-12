class appError extends Error {
  constructor(msg, statusCode = 400, isOperational = true) {
    super(msg);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

module.exports = appError;
