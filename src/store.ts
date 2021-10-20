import Store from 'nedb';
import { RefreshToken } from './models/refresh_token';
import { User } from './models/user';

export const userStore = new Store<User>({
  filename: 'stores/user_store',
  autoload: true,
});

export const refreshTokenStore = new Store<RefreshToken>({
  filename: 'stores/refresh_token_store',
  autoload: true,
});