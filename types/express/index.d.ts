import Express from 'express';

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      userId?: string;
      logout: () => void;
    }
    interface Response {
      userId?: string;
    }
  }
}