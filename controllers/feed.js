const { validationResult } = require('express-validator/check');

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
  console.log(title);
  res.status(201).json({
    message: 'Post created succesfully!',
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: { name: 'Patricio' },
      createAt: new Date()
    }
  });
};
