export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode
    || (err.name === 'ValidationError' || err.name === 'CastError'
      || err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 400 : 500);
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'File is too large.'
    : err.code === 'LIMIT_UNEXPECTED_FILE'
      ? (err.message || 'Unsupported file type.')
      : (err.message || 'Something went wrong.');
  res.status(status).json({ message });
}
