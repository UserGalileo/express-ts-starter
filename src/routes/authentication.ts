import bcrypt from 'bcrypt';
import { Application } from 'express';
import { PassportStatic } from 'passport';
import { withAuth } from '../commands';
import { authGuard } from '../guards/auth.guard';
import { userStore } from '../store';

export function setupRoutes(app: Application, passport: PassportStatic) {

  app.post('/register', (req, res) => {
    const { email, password, name, surname } = req.body;

    if (!email || !password || !name || !surname) {
      // Incomplete request
      return res.status(400).json({
        error: 'Sono richiesti email, username e password.'
      });
    }
    userStore.findOne({ email }, (err, user) => {
      // Already registered
      if (user) {
        return res.status(400).json({
          error: 'Questo utente è già registrato.'
        });
      }
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          // Generic error
          return res.redirect('/error');
        }
        const newUser = { email, displayName: name + ' ' + surname, password: hash };
        userStore.insert(newUser, (err, user) => {
          if (err) {
            // Generic error
            return res.redirect('/error');
          }
          // Success
          res.json({
            message: 'Registrazione avvenuta con successo.'
          });
        })
      });
    })
  });

  /**
   * Creates a session.
   */
  app.post('/login', passport.authenticate('local'), (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.json({
      message: 'Login avvenuto con successo.'
    })
  });

  /**
   * Clears the session.
   */
  app.get("/logout", authGuard, (req, res) => {
    req.logout();
    res.json({
      message: 'Disconnesso con successo.'
    });
  });

  /**
   * Gets the user's info.
   */
  app.get("/me", authGuard, (req, res) => {
    if (!withAuth) {
      return res.json({
        email: 'mario@rossi.com',
        displayName: 'Mario Rossi'
      })
    }
    res.json({
      email: req.user?.email,
      displayName: req.user?.displayName,
    });
  });
}
