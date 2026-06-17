const MAX_TITLE = 200;
const MAX_CONTENT = 20000;
const MAX_AUTHOR = 100;
const MAX_TAG = 50;
const MAX_ARRAY_ITEMS = 50;
const MAX_URL = 2000;

function isString(v) {
  return typeof v === 'string';
}

// Aceita apenas URLs http(s) bem formadas (bloqueia javascript:, data:, etc.)
function isSafeHttpUrl(v) {
  if (!isString(v) || v.length > MAX_URL) return false;
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateStringArray(value, label, errors, { urls = false } = {}) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push(`${label} deve ser um array`);
    return [];
  }
  if (value.length > MAX_ARRAY_ITEMS) {
    errors.push(`${label} excede o máximo de ${MAX_ARRAY_ITEMS} itens`);
    return [];
  }
  for (const item of value) {
    if (urls) {
      if (!isSafeHttpUrl(item)) {
        errors.push(`${label} contém uma URL inválida (apenas http/https são permitidos)`);
        break;
      }
    } else if (!isString(item) || item.length > MAX_TAG) {
      errors.push(`${label} contém um valor inválido`);
      break;
    }
  }
  return value;
}

// Valida e devolve apenas os campos permitidos (whitelist) — evita mass assignment.
module.exports = function validatePost(req, res, next) {
  const body = req.body || {};
  const errors = [];

  const { title, content, author } = body;

  if (!isString(title) || title.trim().length === 0) {
    errors.push('title é obrigatório');
  } else if (title.length > MAX_TITLE) {
    errors.push(`title excede ${MAX_TITLE} caracteres`);
  }

  if (!isString(content) || content.trim().length === 0) {
    errors.push('content é obrigatório');
  } else if (content.length > MAX_CONTENT) {
    errors.push(`content excede ${MAX_CONTENT} caracteres`);
  }

  if (author !== undefined && (!isString(author) || author.length > MAX_AUTHOR)) {
    errors.push('author inválido');
  }

  const images = validateStringArray(body.images, 'images', errors, { urls: true });
  const videos = validateStringArray(body.videos, 'videos', errors, { urls: true });
  const tags = validateStringArray(body.tags, 'tags', errors);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', errors });
  }

  // Só os campos validados seguem adiante.
  req.validatedPost = {
    title: title.trim(),
    content: content.trim(),
    author: author ? author.trim() : undefined,
    images,
    videos,
    tags,
  };

  next();
};
