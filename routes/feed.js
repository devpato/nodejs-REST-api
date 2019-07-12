const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();
const FEED_CONTROLLER = require('../controllers/feed');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
//GET feed/posts
ROUTER.get('/posts', FEED_CONTROLLER.getPosts);

//POST feed/post
ROUTER.post(
  '/post',
  isAuth,
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

ROUTER.put(
  '/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  FEED_CONTROLLER.updatePost
);

ROUTER.delete('/post/:postId', isAuth, FEED_CONTROLLER.deletePost);

module.exports = ROUTER;
