const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String },
    images: [String],
    videos: [String],
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema, 'posts');
