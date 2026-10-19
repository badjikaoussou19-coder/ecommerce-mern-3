exports.notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route introuvable : ${req.originalUrl}`));
};

exports.errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Identifiant invalide';
  } else if (err.code === 11000) {
    status = 400;
    message = 'Cette valeur existe déjà (email ou nom déjà utilisé)';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image trop lourde (3 Mo maximum)' : err.message;
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
