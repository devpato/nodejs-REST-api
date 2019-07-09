const MONGOOSE = require('mongoose');
const SCHEMA = MONGOOSE.Schema;

const POST_SCHEMA = new SCHEMA(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = MONGOOSE.model('Post', POST_SCHEMA);
