# Neukleos People

Next.js frontend for Neukleos HR / people operations. Talks to `neukleos-erp-api`.

## Local setup

1. Copy env and fill values:

```bash
cp .env.local.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Nest API root including `/api/v1` (default `http://localhost:3000/api/v1`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same OAuth web client ID as API `GOOGLE_CLIENT_ID` |

2. On the API, ensure CORS allows the People app origin, e.g. `http://localhost:3001` in `CORS_ORIGINS`, then restart the API.

3. Run the app (port **3001** so it does not clash with the API on 3000):

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Authentication

- Production path: **Continue with Google** → API `POST /authentication/google` (Workspace account must already be provisioned / invited).
- Local helper: **Local developer sign-in** accepts an access token from the API repo:

```bash
npm run auth:seed-dev-admin
npm run auth:sign-access-token -- --userId 22222222-2222-2222-2222-222222222222 --organisationId 11111111-1111-1111-1111-111111111111 --email dev.admin@neukleos.com
```

Dashboard and employee shells require a valid session (`/authentication/me`). Logout clears tokens and revokes the refresh family when present.
