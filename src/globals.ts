import dotenv from 'dotenv';

dotenv.config();

export const accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || 3600;
export const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || 604800;
export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'THEDOGISONTHETABLE';
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'THEDOGISONTHETABLE2';
export const port = process.env.PORT || 3000;
export const appSecret = process.env.APP_SECRET || 'supersecret';
export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
