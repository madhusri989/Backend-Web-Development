# Database Integration

The API keeps its existing HTTP contract while the post repository uses PostgreSQL through Prisma. Prisma-specific calls are isolated to `src/repositories/` and the shared client module.

## Local setup

1. Install PostgreSQL and create a development database, for example `createdb community_dev`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your local PostgreSQL credentials. Never commit `.env`.
3. From this directory, run:

   ```sh
   npm install
   npm run prisma:validate
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   npm start
   ```

The migration command creates and applies the named `init` migration. On an existing environment, use `npm run prisma:deploy` to apply committed migrations without creating new ones.

## Seed safety

The seed script uses upserts and is safe to run repeatedly. It creates a demo author and two example posts; it does not delete or reset existing data. Use a dedicated local development database for experimentation.

## Verify the repository contract

Exercise `GET /posts`, `GET /posts/1`, `GET /posts/999999`, `POST /posts`, `PATCH /posts/1`, `PATCH /posts/999999`, `DELETE /posts/1`, and `DELETE /posts/999999`. A duplicate vote or follow pair is rejected by a database uniqueness constraint. Public server errors return a generic message; detailed database errors are not sent to clients.
