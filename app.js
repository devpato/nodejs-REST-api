const EXPRESS = require('express');
const FEED_ROUTES = require('./routes/feed');
const BODY_PARSER = require('body-parser');
const MONGOOSE = require('mongoose');
const APP = EXPRESS();

APP.use(BODY_PARSER.json());
APP.use(BODY_PARSER.urlencoded({ extended: false }));
APP.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});
APP.use('/feed', FEED_ROUTES);

MONGOOSE.connect('mongodb+srv://admin:admin@cluster0-7jnyx.mongodb.net/posts', {
  useNewUrlParser: true
})
  .then(() => {
    console.log('connected to DB');
    APP.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
