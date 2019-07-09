const EXPRESS = require('express');
const FEED_ROUTES = require('./routes/feed');
const APP = EXPRESS();

APP.use('/feed', FEED_ROUTES);

APP.listen(8080);
