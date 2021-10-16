import Store from 'nedb';
import { User } from './models/user';

export const userStore = new Store<User>({
  filename: 'stores/user_store',
  autoload: true,
  
});