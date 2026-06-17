require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const postsRouter = require('./routes/posts');

const app = express();
app.use(express.json());
app.use('/posts', postsRouter);

connectDB();

// Exporta para Vercel (serverless); listen só em ambiente local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
