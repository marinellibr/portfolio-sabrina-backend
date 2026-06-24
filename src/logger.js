const pino = require('pino');

// Logger estruturado (JSON). Em produção os logs vão para stdout e são
// capturados pela plataforma (Vercel). O nível pode ser ajustado via LOG_LEVEL.
//
// `redact` garante que campos sensíveis nunca apareçam nos logs, mesmo que
// um objeto que os contenha seja passado por engano.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'portfolio-sabrina-backend' },
  redact: {
    paths: [
      'password',
      'req.body.password',
      'req.headers.authorization',
      'headers.authorization',
      'token',
    ],
    censor: '[redacted]',
  },
});

module.exports = logger;
