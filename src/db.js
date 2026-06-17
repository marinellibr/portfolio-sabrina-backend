const mongoose = require('mongoose');

let cached = global._mongooseConnection;

async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) return;

  cached = global._mongooseConnection = mongoose.connect(process.env.MONGODB_URI);
  await cached;
  console.log('MongoDB connected');
}

module.exports = connectDB;
