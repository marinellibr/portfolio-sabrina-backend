const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    coverImage: { type: String, required: true },
    title: { type: String, required: true },
    titleEn: { type: String, required: true },
    description: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    content: { type: String, default: '' },
    button: {
      label: { type: String, required: true },
      link: { type: String, required: true },
    },
    buttonEn: {
      label: { type: String, required: true },
      link: { type: String, required: true },
    },
    categories: [String],
    categoriesEn: [String],
    year: { type: String, required: true },
    projectType: [String],
    projectTypeEn: [String],
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
