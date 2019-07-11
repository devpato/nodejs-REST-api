const { validationResult } = require('express-validator');
const POST = require('../models/posts');
const fs = require('fs');
const path = require('path');

exports.getPosts = (req, res, next) => {
  POST.find()
    .then(posts => {
      res.status(200).json({
        message: 'Post fetched succesfully',
        posts: posts
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const ERROR = new Error('Validation Failed! entered data incorrectly');
    ERROR.statusCode = 422;
    throw ERROR;
  }

  if (!req.file) {
    const ERROR = new Error('No Image provided');
    ERROR.statusCode = 422;
    throw ERROR;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  const post = new POST({
    title: title,
    content: content,
    imageUrl: imageUrl,
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

exports.getPost = (req, res, next) => {
  const POST_ID = req.params.postId;
  POST.findById(POST_ID)
    .then(post => {
      if (!post) {
        const ERROR = new Error('Post not found');
        ERROR.statusCode = 404;
        throw ERROR;
      }
      console.log(post);
      res.status(200).json({
        message: 'Post feched',
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const POST_ID = req.params.postId;
  const TITLE = req.body.title;
  const CONTENT = req.body.content;
  let IMAGE_URL = req.body.image;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const ERROR = new Error('Validation Failed! entered data incorrectly');
    ERROR.statusCode = 422;
    throw ERROR;
  }

  if (req.file) {
    IMAGE_URL = req.file.path;
  }

  if (!IMAGE_URL) {
    const ERROR = new Error('No file picked.');
    ERROR.statusCode = 422;
    throw ERROR;
  }
  console.log('POST ID', POST_ID);
  POST.findById(POST_ID)
    .then(post => {
      if (!post) {
        const ERROR = new Error('Post not found');
        ERROR.statusCode = 404;
        throw ERROR;
      }

      if (IMAGE_URL !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = TITLE;
      post.imageUrl = IMAGE_URL;
      post.content = CONTENT;

      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Post updated',
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const POST_ID = req.params.postId;

  POST.findById(POST_ID)
    .then(post => {
      //checked loggedIn user
      if (!post) {
        const ERROR = new Error('Post not found');
        ERROR.statusCode = 404;
        throw ERROR;
      }

      clearImage(post.imageUrl);
      return POST.findByIdAndRemove(POST_ID);
    })
    .then(() => {
      res.status(200).json({
        message: 'Post deleted'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Helper function
const clearImage = FILE_PATH => {
  FILE_PATH = path.join(__dirname, '..', FILE_PATH);
  fs.unlink(FILE_PATH, err => console.log(err));
};
