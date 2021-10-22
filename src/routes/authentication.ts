import bcrypt from 'bcrypt';
import { Application } from 'express';
import { authGuard } from '../guards/auth.guard';
import { userStore, blacklistedTokenFamilyStore as blacklist, usedTokensStore } from '../store';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || 3600;
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || 604800;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'THEDOGISONTHETABLE';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'THEDOGISONTHETABLE2';

export function setupRoutes(app: Application) {

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
          subject: user._id,
          jwtid: uuid()
        });

        const refreshToken = jwt.sign({
          familyId: uuid()
        }, refreshTokenSecret, {
          expiresIn: refreshTokenExpiration,
          subject: user._id,
          jwtid: uuid()
        });

        // refreshTokenStore.insert({ userId: user._id, token: refreshToken });

        return res.status(200).json({
          message: 'Successful authentication.',
          access_token: accessToken,
          refresh_token: refreshToken
        })
      });
    })
  });

  app.post("/logout", authGuard, (req, res) => {
    const refreshToken = req.body.refresh_token;

    // If a Refresh Token is supplied, blacklist all of its family.
    if (refreshToken) {
      jwt.verify(refreshToken as string, refreshTokenSecret, (err, payload) => {
        if (payload) {
          const currentTimestamp = Math.floor(new Date().getTime() / 1000);

          blacklist.insert({
            blacklistedAt: currentTimestamp,
            familyId: payload.familyId
          });
        }
      });
    }
    res.json({
      message: 'Logged out. Throw away your tokens!'
    });
  });

  /**
   * Exhange a Refresh Token for a new token pair.
   * Implements Refresh Token Rotation and Reuse Strategy.
   */
  app.post('/token', (req, res) => {
    const { refresh_token: oldRefreshToken } = req.body;

    // Token not provided.
    if (!oldRefreshToken) {
      return res.status(401).json({
        message: 'You must provide a refresh_token.'
      });
    }

    jwt.verify(oldRefreshToken as string, refreshTokenSecret, (err, payload) => {
      // This Refresh Token has expired or it's been tampered with.
      if (err) {
        return res.status(403).json({
          message: 'Invalid refresh_token.'
        });
      }

      const currentTimestamp = Math.floor(new Date().getTime() / 1000);

      blacklist.findOne({ familyId: payload?.familyId }, (_, blacklistedFamily) => {
        usedTokensStore.findOne({ token: oldRefreshToken }, (_, usedToken) => {

          // Reuse Detection
          if (usedToken) {
            // Blacklist all of this token's family
            blacklist.insert({
              blacklistedAt: currentTimestamp,
              familyId: payload?.familyId
            });

            return res.status(403).json({
              message: 'Reuse detected, you must re-authenticate.'
            });
          }

          // Token was blacklisted
          if (blacklistedFamily) {
            return res.status(403).json({
              message: 'Invalid refresh_token.'
            });
          }

          // Valid refresh token: nothing happened!
          const accessToken = jwt.sign({
            email: payload?.email,
            displayName: payload?.displayName,
          }, accessTokenSecret, {
            expiresIn: accessTokenExpiration,
            subject: payload?.sub,
            jwtid: uuid()
          });
    
          const refreshToken = jwt.sign({
            familyId: payload?.familyId
          }, refreshTokenSecret, {
            expiresIn: refreshTokenExpiration,
            subject: payload?.sub,
            jwtid: uuid()
          });
    
          usedTokensStore.insert({
            token: oldRefreshToken,
            familyId: payload?.familyId,
            usedAt: currentTimestamp
          });
    
          return res.status(200).json({
            message: 'Tokens refreshed. Throw away the previous ones.',
            access_token: accessToken,
            refresh_token: refreshToken
          })
        })
      })
    })
  })

  /**
   * Gets the user's info.
   */
  app.get("/me", authGuard, (req, res) => {

    userStore.findOne({ _id: req.userId }, (err, user) => {
      if (!user || err) {
        return res.status(401).json({
          error: 'User not found.'
        });
      }

      return res.json({
        email: user?.email,
        displayName: user?.displayName,
      });
    })
  });
}
