const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created!',
        userId: result._id
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const ERROR = new Error('User not found ');
        ERROR.statusCode = 401;
        ERROR.data = errors.array();
        throw ERROR;
      }
      let loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const ERROR = new Error('Wrong password ');
        ERROR.statusCode = 401;
        ERROR.data = errors.array();
        throw ERROR;
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
