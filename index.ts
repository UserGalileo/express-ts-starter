import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { v4 as uuid } from 'uuid';

// Main configuration
dotenv.config();
const FileStore = sessionFileStore(session);
const app = express();
const port = process.env.PORT || 3000;
const appSecret = process.env.APP_SECRET || 'supersecret';

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing Middleware
app.use(cookieParser());

// CORS configuration
app.use(cors({
  credentials: true,
  origin: '*',
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));

// Session management
app.use(
  session({
    genid: (req) => uuid(),
    store: new FileStore(),
    secret: appSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
  })
);

// CSRF protection
const withCsrf = csrf({
  cookie: {
    httpOnly: true
  }
});
app.use(withCsrf);

/**
 * Hello World!
 */
app.get("/", (req: Request, res: Response): Response => {
  return res.status(200).send({
  message: "Hello World!",
  });
});

/**
 * Initial request for a CSRF Token.
 * Must be called at the app start.
 */
 app.get('/csrf-token', withCsrf, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.json({});
});

try {
  app.listen(port, () => {
    console.log(`Running like Forrest Gump on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
