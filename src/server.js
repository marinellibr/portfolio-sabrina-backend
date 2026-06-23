require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');
const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');
const logger = require('./logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Confia no proxy da Vercel para obter o IP real (necessário p/ rate limit)
app.set('trust proxy', 1);

// Atribui request-id e registra cada request (sem logar body/credenciais)
app.use(requestLogger);

// Headers de segurança
app.use(helmet());

// CORS: allowlist por env var (ALLOWED_ORIGINS, separados por vírgula).
// Default = domínio de produção do frontend.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://sabrinacardoso.com')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Permite ferramentas sem origin (curl, Insomnia, server-to-server).
      // A escrita já é protegida por API key, então isso é seguro.
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      // Permite qualquer porta do localhost para desenvolvimento local
      if (/^http:\/\/localhost(:\d+)?$/.test(normalized)) return callback(null, true);
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      return callback(new Error('Origin não permitida pelo CORS'));
    },
  })
);

// Limita o tamanho do corpo da requisição
app.use(express.json({ limit: '100kb' }));

// Rate limiting global
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas requisições, tente novamente mais tarde' },
  })
);

// Garante conexão antes de qualquer request (necessário em serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/auth', authRouter);
app.use('/posts', postsRouter);

// Handler de erros centralizado: loga apenas método/rota/status, nunca body ou dados pessoais
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message === 'Origin não permitida pelo CORS') {
    return res.status(403).json({ message: 'Origin não permitida' });
  }
  (req.log || logger).error(
    { method: req.method, path: req.path, err: err.message },
    'request error'
  );
  res.status(500).json({ message: 'Erro interno do servidor' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logger.info({ port: PORT }, 'server running'));
}

module.exports = app;
