const mongoose = require('mongoose');

// Não enfileira operações: falha rápido se não estiver conectado
mongoose.set('bufferCommands', false);

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Conexão anterior caiu (freeze/thaw do serverless): reseta
  if (cached.promise && mongoose.connection.readyState !== 1) {
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log('MongoDB connected');
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
