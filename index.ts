import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupRoutes } from './src/routes/authentication';
import { frontendUrl, port } from './src/globals';

// Main configuration
const app = express();

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing Middleware
app.use(cookieParser());

// CORS configuration
app.use(cors({
  credentials: true,
  origin: frontendUrl,
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));

/**
 * Hello World!
 */
app.get("/", (req, res) => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

/**
 * Generic error.
 */
 app.get("/error", (req, res) => {
  return res.status(500).json({
    message: 'An error has occurred.'
  });
});

setupRoutes(app);

try {
  app.listen(port, () => {
    console.log(`Running like Forrest Gump on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}