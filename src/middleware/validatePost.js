const MAX_TITLE = 200;
const MAX_CONTENT = 20000;
const MAX_LABEL = 120;
const MAX_ARRAY_ITEMS = 50;
const MAX_URL = 2000;
const MAX_YEAR = 20;

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

function validateStringArray(value, label, errors, { maxLength = MAX_LABEL } = {}) {
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
    if (!isString(item) || item.trim().length === 0 || item.length > maxLength) {
      errors.push(`${label}[${index}] é inválido`);
    }
  });
  return value.map((item) => (isString(item) ? item.trim() : ''));
}

function validateOptionalUrl(value, label, errors) {
  if (value === undefined) return '';
  if (value === '') return '';

  const err = urlError(value);
  if (err) {
    errors.push(`${label} é inválido: ${err}`);
    return '';
  }

  return value;
}

function validateRequiredUrl(value, label, errors) {
  const err = urlError(value);
  if (err) {
    errors.push(`${label} é obrigatório e deve ser uma URL válida: ${err}`);
    return '';
  }

  return value;
}

function validateButton(value, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push('button deve ser um objeto com label e link');
    return { label: '', link: '' };
  }

  const { label, link } = value;

  if (!isString(label) || label.trim().length === 0 || label.length > MAX_LABEL) {
    errors.push(`button.label é obrigatório e deve ter até ${MAX_LABEL} caracteres`);
  }

  const linkError = urlError(link);
  if (linkError) {
    errors.push(`button.link é inválido: ${linkError}`);
  }

  return {
    label: isString(label) ? label.trim() : '',
    link: isString(link) ? link : '',
  };
}

function validateImages(value, errors) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push('images deve ser um array');
    return [];
  }
  if (value.length > MAX_ARRAY_ITEMS) {
    errors.push(`images excede o máximo de ${MAX_ARRAY_ITEMS} itens`);
    return [];
  }

  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`images[${index}] deve ser um objeto com url e cover`);
      return { url: '', cover: false };
    }

    const urlErr = urlError(item.url);
    if (urlErr) {
      errors.push(`images[${index}].url é inválido: ${urlErr}`);
    }
    if (typeof item.cover !== 'boolean') {
      errors.push(`images[${index}].cover deve ser boolean`);
    }

    return {
      url: isString(item.url) ? item.url : '',
      cover: typeof item.cover === 'boolean' ? item.cover : false,
    };
  });
}

// Valida e devolve apenas os campos permitidos (whitelist) — evita mass assignment.
module.exports = function validatePost(req, res, next) {
  const body = req.body || {};
  const errors = [];

  const { title, content, year } = body;

  const coverImage = validateRequiredUrl(body['cover-image'], 'cover-image', errors);

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

  const button = validateButton(body.button, errors);
  const categories = validateStringArray(body.categories, 'categories', errors);
  const projectType = validateStringArray(body.projectType, 'projectType', errors);
  const images = validateImages(body.images, errors);
  const video = validateOptionalUrl(body.video, 'video', errors);

  if (!isString(year) || year.trim().length === 0) {
    errors.push('year é obrigatório');
  } else if (year.length > MAX_YEAR) {
    errors.push(`year excede ${MAX_YEAR} caracteres`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', errors });
  }

  req.validatedPost = {
    'cover-image': coverImage,
    title: title.trim(),
    content: content.trim(),
    button,
    categories,
    year: year.trim(),
    projectType,
    images,
    video,
  };

  next();
};
