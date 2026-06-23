const jwt = require('jsonwebtoken');

// Protege rotas de escrita: exige um JWT válido no header Authorization: Bearer <token>.
module.exports = function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;

  // Falha segura: sem segredo configurado, bloqueia tudo.
  if (!secret) {
    return res.status(500).json({ message: 'JWT não configurado no servidor' });
  }

  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
