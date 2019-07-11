const User = require('../models/user');
const { validationResult } = require('express-validator');
exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const ERROR = new Error('Validation Failed! ');
    ERROR.statusCode = 422;
    ERROR.data = errors.array();
    throw ERROR;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
};
