# VectorBot

An advanced GPT chat client built with Next.js 16 (App Router), Prisma, Clerk auth, and shadcn/ui.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **shadcn/ui** (`base-nova` style) for UI primitives
- **TanStack Query** for client data fetching
- **Prisma** ORM on PostgreSQL (Neon)
- **Clerk** for authentication

## Getting Started

Create a `.env` file with the required secrets:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
```

Then install dependencies, apply the database schema, and run the dev server:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
