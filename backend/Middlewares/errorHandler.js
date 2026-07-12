import AppError from '../Utils/AppError.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for developers
  console.error('ERROR 💥:', err);

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

export default errorHandler;
