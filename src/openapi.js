// Especificação OpenAPI 3.0 da API. Servida como JSON em /openapi.json e
// renderizada com Swagger UI (via CDN) em /docs.
const postSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '665f1b2c3d4e5f6a7b8c9d0e' },
    coverImage: { type: 'string', format: 'uri' },
    title: { type: 'string', maxLength: 200 },
    titleEn: { type: 'string', maxLength: 200 },
    description: { type: 'string', maxLength: 20000 },
    descriptionEn: { type: 'string', maxLength: 20000 },
    content: { type: 'string', maxLength: 20000, deprecated: true },
    button: {
      type: 'object',
      properties: {
        label: { type: 'string', maxLength: 120 },
        link: { type: 'string', format: 'uri' },
      },
    },
    buttonEn: {
      type: 'object',
      properties: {
        label: { type: 'string', maxLength: 120 },
        link: { type: 'string', format: 'uri' },
      },
    },
    categories: { type: 'array', items: { type: 'string', maxLength: 120 } },
    categoriesEn: { type: 'array', items: { type: 'string', maxLength: 120 } },
    year: { type: 'string', maxLength: 20 },
    projectType: { type: 'array', items: { type: 'string', maxLength: 120 } },
    projectTypeEn: { type: 'array', items: { type: 'string', maxLength: 120 } },
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
          cover: { type: 'boolean' },
        },
      },
    },
    video: { type: 'string', format: 'uri' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const postInput = {
  type: 'object',
  required: ['coverImage', 'title', 'titleEn', 'description', 'descriptionEn', 'button', 'buttonEn', 'year'],
  properties: {
    coverImage: { type: 'string', format: 'uri', maxLength: 2000 },
    title: { type: 'string', maxLength: 200 },
    titleEn: { type: 'string', maxLength: 200 },
    description: { type: 'string', maxLength: 20000 },
    descriptionEn: { type: 'string', maxLength: 20000 },
    content: { type: 'string', maxLength: 20000, deprecated: true },
    button: {
      type: 'object',
      required: ['label', 'link'],
      properties: {
        label: { type: 'string', maxLength: 120 },
        link: { type: 'string', format: 'uri', maxLength: 2000 },
      },
    },
    buttonEn: {
      type: 'object',
      required: ['label', 'link'],
      properties: {
        label: { type: 'string', maxLength: 120 },
        link: { type: 'string', format: 'uri', maxLength: 2000 },
      },
    },
    categories: { type: 'array', maxItems: 50, items: { type: 'string', maxLength: 120 } },
    categoriesEn: { type: 'array', maxItems: 50, items: { type: 'string', maxLength: 120 } },
    year: { type: 'string', maxLength: 20 },
    projectType: { type: 'array', maxItems: 50, items: { type: 'string', maxLength: 120 } },
    projectTypeEn: { type: 'array', maxItems: 50, items: { type: 'string', maxLength: 120 } },
    images: {
      type: 'array',
      maxItems: 50,
      items: {
        type: 'object',
        required: ['url', 'cover'],
        properties: {
          url: { type: 'string', format: 'uri', maxLength: 2000 },
          cover: { type: 'boolean' },
        },
      },
    },
    video: { type: 'string', format: 'uri', maxLength: 2000 },
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    errors: { type: 'array', items: { type: 'string' } },
  },
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'ObjectId do post',
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Portfolio Sabrina API',
    version: '1.0.0',
    description:
      'API REST de posts do portfólio. Rotas versionadas sob `/v1`. ' +
      'As rotas sem prefixo (`/auth`, `/posts`) são legadas e serão removidas no futuro.',
  },
  servers: [
    { url: '/v1', description: 'Versão atual' },
    { url: '/', description: 'Legado (deprecated)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: { Post: postSchema, PostInput: postInput, Error: errorSchema },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Autentica o admin e retorna um JWT',
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    expiresIn: { type: 'string', example: '7d' },
                  },
                },
              },
            },
          },
          400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Muitas tentativas' },
        },
      },
    },
    '/posts': {
      get: {
        summary: 'Lista todos os posts',
        tags: ['posts'],
        responses: {
          200: {
            description: 'Lista de posts',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Post' } } } },
          },
        },
      },
      post: {
        summary: 'Cria um post',
        tags: ['posts'],
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PostInput' } } } },
        responses: {
          201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } },
          400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Não autenticado' },
        },
      },
    },
    '/posts/summary': {
      get: {
        summary: 'Lista resumida para listagem',
        tags: ['posts'],
        responses: { 200: { description: 'Lista resumida' } },
      },
    },
    '/posts/{id}': {
      get: {
        summary: 'Busca um post por id',
        tags: ['posts'],
        parameters: [idParam],
        responses: {
          200: { description: 'Post', content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } },
          400: { description: 'ID inválido' },
          404: { description: 'Não encontrado' },
        },
      },
      put: {
        summary: 'Atualiza um post (substituição completa)',
        tags: ['posts'],
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PostInput' } } } },
        responses: {
          200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } },
          400: { description: 'Dados inválidos' },
          401: { description: 'Não autenticado' },
          404: { description: 'Não encontrado' },
        },
      },
      delete: {
        summary: 'Remove um post',
        tags: ['posts'],
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          204: { description: 'Removido' },
          401: { description: 'Não autenticado' },
          404: { description: 'Não encontrado' },
        },
      },
    },
  },
};
