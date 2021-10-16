import { RequestHandler } from "express";
import { withAuth } from "../commands";

/**
 * Ensures the user is authenticated.
 */
 export const authGuard: RequestHandler = (req, res, next) => {
  if (withAuth) {
    return next(null);
  }
  if (req.user) {
    return next(null);
  }
  res.status(401).json({
    message: 'Not authenticated.'
  });
}