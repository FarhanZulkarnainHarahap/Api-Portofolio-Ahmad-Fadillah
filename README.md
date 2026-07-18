# HR Portfolio API

Express + TypeScript backend for an HR professional portfolio CMS.

## Stack

- Node.js, Express, TypeScript
- PostgreSQL with Prisma ORM
- JWT auth with HTTP-only cookies and refresh rotation
- bcrypt password hashing
- Cloudinary upload service with media metadata in PostgreSQL
- Zod validation, Helmet, CORS, Morgan, rate limiting, Multer

## Setup

```bash
cd api
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

No Prisma seed is provided. The database may start empty; content is created through admin endpoints/dashboard.

## Commands

- `npm run dev` - development server
- `npm run build` - compile TypeScript
- `npm run type-check` - TypeScript check
- `npm run test` - Vitest/Supertest smoke tests
- `npm run prisma:generate` - generate Prisma Client
- `npm run prisma:migrate` - run PostgreSQL migration
- `npm run prisma:studio` - open Prisma Studio
- `npm run create-admin` - create the first admin from environment variables

## Main Endpoints

- Public: `/api/v1/public/profile`, `/statistics`, `/experiences`, `/expertise`, `/projects`, `/projects/:slug`, `/achievements`, `/documents`, `/certifications`, `/testimonials`, `/blog`, `/blog/:slug`, `/dashboard-widgets`, `/settings`, `POST /contact`
- Auth: `/api/v1/auth/login`, `/refresh`, `/logout`, `/me`, `/change-password`
- Admin CRUD: `/api/v1/admin/:resource`
- Media: `/api/v1/admin/media/upload`, `/api/v1/admin/media`

## Cloudinary

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Uploaded files are stored under `hr-portfolio/*` folders and recorded in the `Media` table. Deleting media calls Cloudinary and soft-deletes the database row.

## Deployment

Deploy the API to Vercel or another Node.js host. Configure production environment variables in the hosting dashboard, including `DATABASE_URL`, `FRONTEND_URL`, JWT secrets, Cloudinary keys, and any email provider key. Keep `.env` local only; commit `.env.example` with blank values.
