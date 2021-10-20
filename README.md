# Node starter w/ Authentication (Express, TypeScript, JWT)

> A starter template for demo or instructional purposes.

## Features

- TypeScript
- Express
- CORS
- Authentication
  - Registration
  - Login with JWT
  - Refresh Token
  - Refresh Token Rotation
  - Reuse Detection

## Main libraries

- cors (for CORS)
- NeDB (MongoDB alternative, saves on disk, no setup required)
- jsonwebtoken

## Get started

Make sure to add a `.env` file at the root of the project, with these fields:

```
PORT=...
APP_SECRET=...
FRONTEND_URL=...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800
```

- `PORT` specifies on which port should Node start
- `APP_SECRET` is a random secret value (not used for now)
- `FRONTEND_URL` is the URL of your frontend, needed for CORS (`Access-Control-Allow-Credentials`)
- `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are random secret values used for JWTs
- `ACCESS_TOKEN_EXPIRATION` and `REFRESH_TOKEN_EXPIRATION` are the lifespans of the JWTs

Get started by running `npm run dev` (dev mode, hot reloading) or `npm start` (build).

## How to authenticate

1. Register a new user at `/register`.
2. Login at `/login`. You'll get an `access_token` and a `refresh_token`.
3. When the `access_token` expires (HTTP error `401`), send the `refresh_token` to the `/token` endpoint to get a new pair of tokens. The previous `refresh_token` is invalidated and cannot be sent again.
4. Get the user's info at `/me`.
5. Logout at `/logout`. You can send a `refresh_token` and the server will delete it and all of its family.

_Note: This server implements Refresh Token Rotation (issues a new RT at every refresh) and Reuse Detection (if one attempts to use an invalid RT, all of the RTs gets deleted and the user is logged out)._