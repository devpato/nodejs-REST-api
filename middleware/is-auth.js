const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const ERROR = new Error('Not authenticated ');
    ERROR.statusCode = 401;
    ERROR.data = errors.array();
    throw ERROR;
  }
  const token = req.get('Authorization').split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, 'secret');
  } catch (err) {
    throw err;
  }

  if (!decodedToken) {
    const ERROR = new Error('Not authenticated ');
    ERROR.statusCode = 401;
    ERROR.data = errors.array();
    throw ERROR;
  }

  req.userId = decodedToken.userId;
  next();
};
