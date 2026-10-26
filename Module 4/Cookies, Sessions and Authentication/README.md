# Session Authentication

## Setup

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Set `COOKIE_SECRET` in `.env` to at least 32 random characters. Keep `COOKIE_SECURE=false` for local HTTP; production must use HTTPS with `COOKIE_SECURE=true`.

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

## Endpoints

- `POST /auth/login` with JSON `{ "email": "sam@example.com", "password": "SessionDemo!48" }` creates a server-side session and sets the signed `sid` cookie.
- `GET /auth/me` returns safe identity fields only when the signed cookie resolves to a live server-side session.
- `POST /auth/logout` destroys the session, clears the cookie, and returns `204`. Repeated logout is safe.

Use a Postman cookie jar or curl `-c cookies.txt` and `-b cookies.txt` to preserve the cookie between requests. Try login, `/auth/me`, then logout and verify the old cookie no longer authenticates.

The supplied session store is an in-memory `Map` intended only for learning and local execution. Sessions disappear on restart and are not shared between server processes. Production deployments need a shared store with expiration, such as Redis.

Never commit `.env` or real secrets. The committed `.env.example` contains placeholders only.
