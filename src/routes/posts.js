const { Router } = require('express');
const Post = require('../models/Post');

const router = Router();

// GET /posts — retorna todos os posts
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// GET /posts/:id — retorna um post específico
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post não encontrado' });
  res.json(post);
});

// POST /posts — cria um novo post
router.post('/', async (req, res) => {
  const { title, content, author, tags } = req.body;
  const post = await Post.create({ title, content, author, tags });
  res.status(201).json(post);
});

module.exports = router;
