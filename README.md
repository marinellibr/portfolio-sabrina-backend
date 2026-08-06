# Portfolio Sabrina — Backend

<p align="center">
  <a href="https://sabrinacardoso.com">
    <img src="https://raw.githubusercontent.com/marinellibr/portfolio-sabrina-resources/refs/heads/main/images/header-logo.png" alt="Portfolio Sabrina"/>
  </a>
</p>

<h1 align="center">Portfolio Sabrina — Backend</h1>

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-black)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6BA539)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

</p>

---

## Overview

**Portfolio Sabrina Backend** is the REST API that powers the Portfolio Sabrina platform.

It was designed as a production-ready backend focused on security, maintainability and scalability instead of a simple CRUD application.

The API is responsible for:

- Authentication
- Portfolio content management
- Curriculum delivery
- Analytics ingestion
- Resource integration
- OpenAPI documentation
- Security and observability

## Architecture

```text
Angular Frontend
        │
   HTTPS / JSON
        │
        ▼
Express REST API
        │
 ├── Authentication
 ├── Validation
 ├── Logging
 ├── OpenAPI
 └── Business Rules
        │
        ▼
    MongoDB Atlas

Static Resources
(GitHub Repository)
```

## Main Features

### Authentication

- JWT Authentication
- Password hashing with bcrypt
- Protected administrative routes
- Login rate limiting

### Content Management

- Create projects
- Update projects
- Delete projects
- Public project listing
- Optimized summary endpoint
- Localized content support

### Security

- Helmet
- CORS Allow List
- Payload validation
- Rate limiting
- Structured logging
- Sensitive data redaction
- Environment-based configuration

### Observability

- Request IDs
- Request duration
- Structured logs
- HTTP timing
- Error tracking

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | REST API |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Helmet | Security |
| Pino | Logging |
| Swagger/OpenAPI | API Documentation |

## Project Structure

```text
src/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── services/
 ├── logger.js
 ├── db.js
 ├── openapi.js
 └── server.js
```

## API

### Public

```
GET /v1/posts
GET /v1/posts/summary
GET /v1/posts/:id
GET /v1/curriculum/:language
```

### Protected

```
POST /v1/auth/login

POST /v1/posts
PUT /v1/posts/:id
DELETE /v1/posts/:id
```

Authorization:

```
Authorization: Bearer <JWT_TOKEN>
```

## Environment

Example:

```env
PORT=3000
MONGODB_URI=
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
CORS_ALLOWED_ORIGINS=
```

## Running locally

```bash
git clone https://github.com/marinellibr/portfolio-sabrina-backend

cd portfolio-sabrina-backend

npm install

npm run dev
```

Server:

```
http://localhost:3000
```

Swagger:

```
http://localhost:3000/docs
```

## Deployment

The application is designed to run on **Vercel** using serverless functions while connecting to MongoDB Atlas.

## Design Decisions

- Versioned API (`/v1`)
- Thin route handlers
- Centralized middleware
- Structured logging
- JWT authentication
- OpenAPI-first documentation
- Separate Resources repository
- Optimized endpoints for list/detail
- Environment-based configuration

## Related Repositories

Frontend

https://github.com/marinellibr/portfolio-sabrina-frontend

Resources

https://github.com/marinellibr/portfolio-sabrina-resources

## Future Improvements

- Refresh Tokens
- E2E Tests
- API Metrics Dashboard
- Caching Layer
- Background Jobs
- Webhooks
- Search API
- Audit Log

## Author

**Luiz Marinelli**

Senior Frontend Engineer

GitHub: https://github.com/marinellibr

LinkedIn: https://linkedin.com/in/luizmarinelli

---

AI-assisted development was intentionally adopted to accelerate repetitive implementation tasks, documentation, experimentation and refactoring.

Architecture, API contracts, security, observability and engineering decisions remained human-driven throughout the project.
