# Node starter w/ Authentication (Express, TypeScript)

> A starter template for demo or instructional purposes.

## Features

- TypeScript
- Express
- CORS
- Authentication
  - Registration
  - Login
  - CSRF Token

## Main libraries

- cors (for CORS)
- csurf (for CSRF Protection)
- express-session (for sessions)
- session-file-store (for saving session information on disk)
- passport, passport-local (for authentication)
- NeDB (MongoDB alternative, saves on disk, no setup required)

## Get started

Make sure to add a `.env` file at the root of the project, with these fields:

```
PORT=...
APP_SECRET=...
FRONTEND_URL=...
```

- `PORT` specifies on which port should Node start
- `APP_SECRET` is a random secret value, used for sessions
- `FRONTEND_URL` is the URL of your frontend, needed for CORS (`Access-Control-Allow-Credentials`)

Get started by running `npm run dev` (dev mode, hot reloading) or `npm start` (build).


