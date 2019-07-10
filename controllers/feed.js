const { validationResult } = require('express-validator');
const POST = require('../models/posts');

exports.getPosts = (req, res, next) => {
  POST.find()
    .then(posts => {
      res.status(200).json({
        posts: posts
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const ERROR = new Error('Validation Failed! entered data incorrectly');
    ERROR.statusCode = 422;
    throw ERROR;
  }
  const title = req.body.title;
  const content = req.body.content;

  const post = new POST({
    title: title,
    content: content,
    imageUrl: 'images/duck.jpg',
    creator: { name: 'Patricio' }
  });

  post
    .save()
    .then(createdPost => {
      console.log(title);
      res.status(201).json({
        message: 'Post created succesfully!',
        post: createdPost
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
