const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    'cover-image': { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    button: {
      label: { type: String, required: true },
      link: { type: String, required: true },
    },
    categories: [String],
    year: { type: String, required: true },
    projectType: [String],
    images: [
      {
        _id: false,
        url: { type: String, required: true },
        cover: { type: Boolean, required: true },
      },
    ],
    video: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema, 'posts');
