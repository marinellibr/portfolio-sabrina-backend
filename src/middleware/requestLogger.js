const { randomUUID } = require('crypto');
const logger = require('../logger');

// Atribui um id único a cada requisição e registra um log estruturado quando
// a resposta termina. Nunca loga o corpo da requisição nem headers sensíveis —
// apenas metadados (método, rota, status, duração).
module.exports = function requestLogger(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  req.log = logger.child({ reqId: req.id });

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    req.log.info(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Math.round(durationMs),
      },
      'request'
    );
  });

  next();
};
