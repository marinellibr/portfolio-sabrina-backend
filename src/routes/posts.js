const { Router } = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const requireApiKey = require('../middleware/auth');
const validatePost = require('../middleware/validatePost');

const router = Router();

// GET /posts — público, retorna todos os posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id — público, retorna um post específico
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post não encontrado' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts — protegido por API key + validação de input
router.post('/', requireApiKey, validatePost, async (req, res, next) => {
  try {
    const post = await Post.create(req.validatedPost);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
