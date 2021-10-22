import Store from 'nedb';
import { BlacklistedTokenFamily, UsedToken } from './models/refresh_token';
import { User } from './models/user';

export const userStore = new Store<User>({
  filename: 'stores/user_store',
  autoload: true,
});

export const blacklistedTokenFamilyStore = new Store<BlacklistedTokenFamily>({
  filename: 'stores/blacklisted_token_families_store',
  autoload: true,
});

export const usedTokensStore = new Store<UsedToken>({
  filename: 'stores/used_tokens_store',
  autoload: true,
});