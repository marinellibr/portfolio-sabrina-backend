const MAX_TITLE = 200;
const MAX_CONTENT = 20000;
const MAX_TAG = 50;
const MAX_ARRAY_ITEMS = 50;
const MAX_URL = 2000;

function isString(v) {
  return typeof v === 'string';
}

// Valida o formato de uma URL de mídia. Além de exigir http/https, garante
// que a URL tenha um hostname real e não embuta credenciais (user:pass@host),
// que poderiam vazar ou indicar um payload malicioso. A validação é de formato
// (não faz requisição de rede), para não introduzir latência/flakiness em
// ambiente serverless.
function urlError(v) {
  if (!isString(v)) return 'não é uma string';
  if (v.length > MAX_URL) return `excede ${MAX_URL} caracteres`;
  if (/\s/.test(v)) return 'contém espaços';
  let url;
  try {
    url = new URL(v);
  } catch {
    return 'não é uma URL válida';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'usa um protocolo não permitido (apenas http/https)';
  }
  if (!url.hostname || !url.hostname.includes('.')) {
    return 'não possui um host válido';
  }
  if (url.username || url.password) {
    return 'não pode conter credenciais embutidas';
  }
  return null;
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
  value.forEach((item, index) => {
    if (urls) {
      const err = urlError(item);
      if (err) {
        errors.push(`${label}[${index}] é inválido: ${err}`);
      }
    } else if (!isString(item) || item.length > MAX_TAG) {
      errors.push(`${label}[${index}] é inválido`);
    }
  });
  return value;
}

// Valida e devolve apenas os campos permitidos (whitelist) — evita mass assignment.
module.exports = function validatePost(req, res, next) {
  const body = req.body || {};
  const errors = [];

  const { title, content } = body;

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

  const images = validateStringArray(body.images, 'images', errors, { urls: true });
  const videos = validateStringArray(body.videos, 'videos', errors, { urls: true });
  const tags = validateStringArray(body.tags, 'tags', errors);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', errors });
  }

  req.validatedPost = {
    title: title.trim(),
    content: content.trim(),
    images,
    videos,
    tags,
  };

  next();
};
