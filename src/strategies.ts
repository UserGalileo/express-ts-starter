import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { userStore } from './store';

export const localStrategy = new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
}, (email: string, password: string, done: Function) => {
  if (!email || !password) return done(null, false);
  userStore.findOne({email}, (err, user) => {
    if (!user) {
      return done(null, false);
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
});
