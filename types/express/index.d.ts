import { User as IUser } from '../../src/models/user';

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      user?: IUser;
      logout: () => void;
    }
    interface Response {
      user?: IUser;
    }
  }
}