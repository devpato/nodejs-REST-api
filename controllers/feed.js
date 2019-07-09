const { validationResult } = require('express-validator');
const POST = require('../models/posts');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'test',
        content: 'This is a post ',
        imageUrl: 'images/duck.jpg',
        creator: {
          name: 'Pato'
        },
        date: new Date()
      }
    ]
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validator failed, entered data is incorrect',
      errors: errors.array()
    });
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
      console.log(err);
    });
};
