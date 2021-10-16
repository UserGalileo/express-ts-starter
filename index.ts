import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import sessionFileStore from 'session-file-store';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { v4 as uuid } from 'uuid';
import passport from 'passport';
import { setupRoutes } from './src/routes/authentication';
import { localStrategy } from './src/strategies';
import { userStore } from './src/store';

// Main configuration
dotenv.config();
const FileStore = sessionFileStore(session);
const app = express();
const port = process.env.PORT || 3000;
const appSecret = process.env.APP_SECRET || 'supersecret';

// Passport Strategy name definitions
passport.use("local", localStrategy);

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

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  userStore.findOne({ _id }, (err, user) => {
    done(null, user);
  })
});

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
app.get("/", (req, res) => {
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

setupRoutes(app, passport);

try {
  app.listen(port, () => {
    console.log(`Running like Forrest Gump on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
