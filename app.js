const EXPRESS = require('express');
const FEED_ROUTES = require('./routes/feed');
const AUTH_ROUTES = require('./routes/auth');
const BODY_PARSER = require('body-parser');
const MONGOOSE = require('mongoose');
const APP = EXPRESS();
// const PATH = require('path');
const MULTER = require('multer');
const FILE_STORAGE = MULTER.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const FILE_FILTER = (req, file, cb) => {
  const mimetypes = ['image/png', 'image/jpg', 'image/jpeg'];
  cb(null, mimetypes.find(mimetype => mimetype === file.mimetype));
};

APP.use(BODY_PARSER.json());
APP.use(
  MULTER({ storage: FILE_STORAGE, fileFilter: FILE_FILTER }).single('image')
);
APP.use(BODY_PARSER.urlencoded({ extended: false }));
APP.use('/images', EXPRESS.static('images'));
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
APP.use('/auth', AUTH_ROUTES);

APP.use((error, req, res, next) => {
  console.log(error);
  const STATUS = error.statusCode || 500;
  const MESSAGE = error.message;
  const DATA = error.data;
  res.status(STATUS).json({ message: MESSAGE, data: DATA });
});

MONGOOSE.connect('mongodb+srv://admin:admin@cluster0-7jnyx.mongodb.net/posts', {
  useNewUrlParser: true
})
  .then(() => {
    console.log('connected to DB');
    const server = APP.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch(err => {
    console.log(err);
  });
