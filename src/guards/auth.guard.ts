import { RequestHandler } from "express";
import jwt from 'jsonwebtoken';
import { accessTokenSecret } from "../globals";

/**
 * Ensures the user is authenticated.
 */
 export const authGuard: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Missing access token.'
    });
  }

  // Header: "Bearer [access_token]"
  const accessToken = authHeader.split(' ')[1];

  jwt.verify(accessToken, accessTokenSecret, (err, payload) => {
    // This Access Token has been tampered with or it's expired.
    if (err) {
      return res.status(401).json({
        message: 'Invalid access token.'
      });
    }

    // Successful authentication!
    req.userId = payload?.sub;
    next();
  });
}