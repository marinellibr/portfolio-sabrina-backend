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
    const { username, password } = req.body || {};

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    const secret = process.env.JWT_SECRET;

    if (!adminUsername || !adminHash || !secret) {
      return res.status(500).json({ message: 'Autenticação não configurada no servidor' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'username e password são obrigatórios' });
    }

    const usernameOk = username.trim().toLowerCase() === adminUsername.trim().toLowerCase();
    const passwordOk = await bcrypt.compare(password, adminHash);

    // Mensagem genérica: não revela se foi o username ou a senha que errou.
    if (!usernameOk || !passwordOk) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ sub: adminUsername, role: 'admin' }, secret, {
      expiresIn: '7d',
    });

    res.json({ token, expiresIn: '7d' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
