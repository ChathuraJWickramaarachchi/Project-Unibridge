const errorHandler = (err, req, res, next) => {
  // Check if next is a function
  if (typeof next !== 'function') {
    console.error('Next is not a function:', typeof next);
    console.error('Error object:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error - middleware issue',
    });
  }

  let error = { ...err };
  error.message = err.message;

  // Log error
  console.log('Error caught by errorHandler:', err);
  console.log('Error name:', err.name);
  console.log('Error message:', err.message);
  console.log('Error stack:', err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;