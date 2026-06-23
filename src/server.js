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

// Documentação da API (pública). Montada antes do helmet para que o CSP não
// bloqueie o carregamento do Swagger UI via CDN, e antes do rate limit/DB para
// que continue acessível mesmo sob carga ou com o banco indisponível.
const openapiSpec = require('./openapi');
app.get('/openapi.json', (req, res) => res.json(openapiSpec));
app.get('/docs', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portfolio Sabrina API — Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>`);
});

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

// Rotas versionadas (atuais)
app.use('/v1/auth', authRouter);
app.use('/v1/posts', postsRouter);

// Rotas legadas (sem versão) — mantidas temporariamente para não quebrar
// clientes já publicados enquanto migram para /v1. Serão removidas no futuro.
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
