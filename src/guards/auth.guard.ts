import { RequestHandler } from "express";

/**
 * Ensures the user is authenticated.
 */
 export const authGuard: RequestHandler = (req, res, next) => {
  if (req.user) {
    return next(null);
  }
  res.status(401).json({
    message: 'Not authenticated.'
  });
}