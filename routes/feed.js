const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();
const FEED_CONTROLLER = require('../controllers/feed');
module.exports = ROUTER;

//GET feed/posts
ROUTER.get('/posts', FEED_CONTROLLER.getPosts);

//POST feed/post
ROUTER.post('/post', FEED_CONTROLLER.createPost);
