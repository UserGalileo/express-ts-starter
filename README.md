# Node starter w/ Authentication (Express, TypeScript)

> A starter template for demo or instructional purposes.
> Contains some demo routes

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

### If you don't need authentication
Get started by running `npm run dev` (dev mode, hot reloading) or `npm start` (build).

### If you need authentication
Get started by running `npm run dev:auth` (dev mode, hot reloading) or `npm run start:auth` (build).


## How to authenticate

0. Make sure to send requests with `withCredentials` set to `true`.
1. As soon as the front-end starts, make a `GET` request for a _CSRF Token_ at `/csrf-token`.
2. Grab the token from the `XSRF-TOKEN` Cookie.
3. From now on, every state-changing request must include this token as a header named `X-XSRF-Token`.
4. Register a new user at `/register`.
5. Login at `/login`.
6. Get the user's info at `/me`.
7. Logout at `/logout`.

_Note: Most front-end frameworks handle points 2-3 automatically (eg. Angular)_