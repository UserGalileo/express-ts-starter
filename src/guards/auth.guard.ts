import { RequestHandler } from "express";
import jwt from 'jsonwebtoken';
import { accessTokenSecret } from "../globals";
import { userStore } from "../store";

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

    userStore.findOne({ _id: payload?.sub }, (err, user) => {
      // This Access Token doesn't belong to any user, maybe it's been deleted.
      if (!user || err) {
        return res.status(401).json({
          error: 'Invalid access token.'
        });
      }
      // Successful authentication!
      req.user = user;
      next();
    })
  });
}