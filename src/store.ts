import Store from 'nedb';
import { Card } from './models/card';
import { Contact } from './models/contact';
import { User } from './models/user';

export const userStore = new Store<User>({
  filename: 'stores/user_store',
  autoload: true,
});

export const cardStore = new Store<Card>({
  filename: 'stores/card_store',
  autoload: true,
});

export const contactStore = new Store<Contact>({
  filename: 'stores/contact_store',
  autoload: true,
});