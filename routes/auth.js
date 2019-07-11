const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();
const { body } = require('express-validator');
const User = require('../models/user');
const AUTH_CONTROLLER = require('../controllers/auth');

ROUTER.put('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('E-mail address already exists!');
        }
      });
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 5 }),
  body('name')
    .trim()
    .not()
    .isEmpty()
]),
  AUTH_CONTROLLER.signup;

module.exports = ROUTER;
