require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const postsRouter = require('./routes/posts');

const app = express();
app.use(express.json());

// Garante conexão antes de qualquer request (necessário em serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.use('/posts', postsRouter);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
