// Protege rotas de escrita exigindo uma API key secreta no header.
// A key fica em env var (API_KEY) — nunca commitada.
module.exports = function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;

  // Falha segura: se a key não estiver configurada no servidor, bloqueia tudo.
  if (!expected) {
    return res.status(500).json({ message: 'API key não configurada no servidor' });
  }

  const provided = req.get('x-api-key');

  if (!provided || provided !== expected) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  next();
};
