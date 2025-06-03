# 🛡️ NestJS Starter Template

This is a template project created with [NestJS](https://nestjs.com/), designed to accelerate the development of applications that require authentication, job queue handling with BullMQ, email sending, and bulk user loading via Excel files.

## 🚀 Key Features

- 🔐 **JWT Authentication** (with `ADMIN` and `USER` roles)
- 📩 **Email sending** using Mailer with Gmail OAuth2 or Mailpit support
- 📊 **Bulk user loading** from `.xlsx` files
- 🧵 **Asynchronous processing** with BullMQ and Redis
- 🔄 **Email verification** with conditional redirection
- 📦 **Modular structure** for easy extension
- 📚 **Automatic documentation** with Swagger

---

## 🗂️ Project Structure

```text
src
├── auth            # Authentication and authorization module
├── config          # Environment configuration, validations
├── jobs            # BullMQ processors for heavy tasks
├── mailer          # Use cases for email sending
├── prisma          # Prisma ORM configuration
├── seed            # Initial data insertion, dev environment only
├── shared          # Shared utilities
├── app.module.ts   # Root module
└── main.ts         # Application bootstrap
templates
├── email           # Email templates
```

## 📦 Installation

```bash
git clone https://github.com/Alanlb195/auth-roles-templete.git
cd auth-roles-templete
npm install
```

## ⚙️ Environment Variables

Create a .env file in the project root based on the env.template file and
configure the necessary variables

## 🐳 Docker

To start the database, Redis, and Mailpit in development:

```bash
docker-compose up -d
```

📜 Swagger Documentation

```bash
http://localhost:3000/api
```

## 🧰 Useful Scripts

```bash
# Development
npm run start:dev

# Build
npm run build

# Run seeding (two users)
curl http://localhost:3000/api/seed
```

## 📦 Key Dependencies

- @nestjs/jwt, passport-jwt: JWT Auth
- @nestjs-modules/mailer, nodemailer: Email sending
- bullmq, ioredis: Job queue handling
- xlsx: Excel file processing
- prisma: ORM for PostgreSQL database
- @nestjs/swagger: API documentation

## 📝 Additional Notes

You can extend the role system if your project requires one that uses specific
permissions per user. BullMQ can work with any Redis-compatible provider. For
example, Upstash in production. Using Gmail for email sending requires OAuth2
configuration in Google Cloud Console. In Docker environments, use
MAIL_HOST=mailpit instead of localhost.
