require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const postsRouter = require('./routes/posts');

const app = express();
app.use(express.json());

app.use('/posts', postsRouter);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
