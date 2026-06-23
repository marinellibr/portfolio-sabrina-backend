const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const router = Router();

// Rate limit estrito no login para dificultar brute-force de senha.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login, tente novamente mais tarde' },
});

// POST /auth/login — valida credenciais (admin único em env var) e devolve um JWT.
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    const secret = process.env.JWT_SECRET;

    if (!adminEmail || !adminHash || !secret) {
      return res.status(500).json({ message: 'Autenticação não configurada no servidor' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'email e password são obrigatórios' });
    }

    const emailOk = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
    const passwordOk = await bcrypt.compare(password, adminHash);

    // Mensagem genérica: não revela se foi o email ou a senha que errou.
    if (!emailOk || !passwordOk) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ sub: adminEmail, role: 'admin' }, secret, {
      expiresIn: '7d',
    });

    res.json({ token, expiresIn: '7d' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
