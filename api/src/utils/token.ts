import crypto from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { IUser } from '../models/user.model';
import type { AuthPayload } from '../types/auth';

export const signAccessToken = (user: IUser): string => {
  const payload: AuthPayload = { sub: user._id.toString(), role: user.role };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as SignOptions);
};

export const signRefreshToken = (user: IUser): string => {
  
  return jwt.sign({ sub: user._id.toString(), jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): AuthPayload =>
  jwt.verify(token, env.jwt.accessSecret) as AuthPayload;

export const verifyRefreshToken = (token: string): { sub: string } =>
  jwt.verify(token, env.jwt.refreshSecret) as { sub: string };


export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
