const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();
const FEED_CONTROLLER = require('../controllers/feed');
const { body } = require('express-validator');
module.exports = ROUTER;

//GET feed/posts
ROUTER.get('/posts', FEED_CONTROLLER.getPosts);

//POST feed/post
ROUTER.post(
  '/post',
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  FEED_CONTROLLER.createPost
);

ROUTER.get('/post/:postId', FEED_CONTROLLER.getPost);
