exports.getPosts = (req, res, next) => {
  res
    .status(200)
    .json({ posts: [{ title: 'test', content: 'This is a post ' }] });
};
