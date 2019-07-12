const { validationResult } = require('express-validator');
const POST = require('../models/posts');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  POST.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return POST.find()
        .populate('creator')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Post fetched succesfully',
        posts: posts,
        totalItems: totalItems
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
  let creator;
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
    creator: req.userId
  });

  post
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: 'Post created succesfully!',
        post: post,
        creator: { _id: creator._id, name: creator.name }
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

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
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

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return POST.findByIdAndRemove(POST_ID);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(POST_ID);
      return user.save();
    })
    .then(user => {
      res.status(200).json({
        message: 'Post deleted',
        user: user,
        user_posts: user.posts
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
