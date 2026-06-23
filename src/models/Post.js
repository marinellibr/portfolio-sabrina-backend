const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [String],
    videos: [String],
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema, 'posts');
