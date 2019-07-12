const { validationResult } = require('express-validator');
const POST = require('../models/posts');
const fs = require('fs');
const io = require('../socket');
const path = require('path');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await POST.find().countDocuments();
    const posts = await POST.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: 'Fetched posts successfully.',
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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
    creator: req.userId
  });

  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const POST_ID = req.params.postId;
  const post = await POST.findById(POST_ID);
  try {
    if (!post) {
      const ERROR = new Error('Post not found');
      ERROR.statusCode = 404;
      throw ERROR;
    }
    res.status(200).json({
      message: 'Post feched',
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await POST.findById(POST_ID);
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

    const result = await post.save();
    res.status(200).json({
      message: 'Post updated',
      post: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await POST.findById(postId);

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    // Check logged in user
    clearImage(post.imageUrl);
    await POST.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: 'Deleted post.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Helper function
const clearImage = FILE_PATH => {
  FILE_PATH = path.join(__dirname, '..', FILE_PATH);
  fs.unlink(FILE_PATH, err => console.log(err));
};
