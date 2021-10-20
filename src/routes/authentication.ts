import bcrypt from 'bcrypt';
import { Application } from 'express';
import { PassportStatic } from 'passport';
import { authGuard } from '../guards/auth.guard';
import { userStore, refreshTokenStore } from '../store';
import jwt from 'jsonwebtoken';

const accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || 3600;
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || 604800;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'THEDOGISONTHETABLE';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'THEDOGISONTHETABLE2';

export function setupRoutes(app: Application, passport: PassportStatic) {

  app.post('/register', (req, res) => {
    const { email, password, name, surname } = req.body;

    if (!email || !password || !name || !surname) {
      // Incomplete request
      return res.status(400).json({
        error: 'You must provide email, username and password.'
      });
    }
    userStore.findOne({ email }, (err, user) => {
      // Already registered
      if (user) {
        return res.status(400).json({
          error: 'This user already exists.'
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
            message: 'Successful registration.'
          });
        })
      });
    })
  });

  app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'You need to provide email and password.'
      })
    }

    userStore.findOne({email}, (err, user) => {
      if (!user) {
        return res.status(401).json({
          message: 'User not found.'
        })
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          return res.status(401).json({
            message: 'Incorrect password.'
          })
        }

        // Successful authentication
        const accessToken = jwt.sign({
          email: email,
          displayName: user.displayName,
        }, accessTokenSecret, {
          expiresIn: accessTokenExpiration,
        });

        const refreshToken = jwt.sign({}, refreshTokenSecret, {
          expiresIn: refreshTokenExpiration,
        });

        refreshTokenStore.insert({ userId: user._id, token: refreshToken });

        return res.status(200).json({
          message: 'Successful authentication.',
          access_token: accessToken,
          refresh_token: refreshToken
        })
      });
    })
  });

  app.get("/logout", authGuard, (req, res) => {
    const refreshToken = req.body.refresh_token;

    // If a Refresh Token is supplied, remove it and all of its family.
    if (refreshToken) {
      refreshTokenStore.remove({ token: refreshToken });
      refreshTokenStore.remove({ genesisToken: refreshToken });
    }
    res.json({
      message: 'Logged out. Throw away your tokens!'
    });
  });

  /**
   * Exhange a Refresh Token for a new token pair.
   */
  app.post('/token', (req, res) => {
    const { refresh_token } = req.body;

    // Token not provided.
    if (!refresh_token) {
      return res.status(401).json({
        message: 'You must provide a refresh_token.'
      });
    }

    jwt.verify(refresh_token as string, refreshTokenSecret, (err, _) => {
      // This Refresh Token has expired.
      if (err) {
        return res.status(403).json({
          message: 'Invalid refresh_token.'
        })
      }
    })

    refreshTokenStore.findOne({ token: refresh_token }, (err, rt) => {

      // Reuse Detection: invalid token. Invalidate all of its family.
      if (rt.invalid) {
        refreshTokenStore.update({ genesisToken: rt.genesisToken || rt.token }, { $set: { invalid: true } }, { multi: true });

        return res.status(403).json({
          message: 'Reuse detected, you must re-authenticate.'
        })
      }

      // Invalid refresh token (generic).
      if (err || !rt) {
        return res.status(403).json({
          message: 'Invalid refresh_token.'
        });
      }

      userStore.findOne({ _id: rt.userId }, (err, user) => {

        // The refresh token doesn't belong to any user: maybe the user has been deleted.
        if (err || !user) {
          return res.status(403).json({
            message: 'Invalid refresh_token.'
          });
        }

        // Generate new tokens
        const accessToken = jwt.sign({
          email: user.email,
          displayName: user.displayName,
        }, accessTokenSecret, {
          expiresIn: accessTokenExpiration,
          subject: user._id
        });

        const refreshToken = jwt.sign({}, refreshTokenSecret, {
          expiresIn: refreshTokenExpiration,
        });

        // Invalidate the previous token.
        refreshTokenStore.update({ token: refresh_token }, { $set: { invalid: true } }, { multi: true });

        // Insert a new Refresh Token. The genesis is either the previous genesis, or the previous token itself.
        refreshTokenStore.insert({ userId: user._id, token: refreshToken, genesisToken: rt.genesisToken || rt.token });

        return res.status(200).json({
          message: 'Tokens refreshed. Throw away the previous ones.',
          access_token: accessToken,
          refresh_token: refreshToken
        })
      })
    })
  })

  /**
   * Gets the user's info.
   */
  app.get("/me", authGuard, (req, res) => {
    res.json({
      email: req.user?.email,
      displayName: req.user?.displayName,
    });
  });
}
