import type { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { UserRole } from '../types/enums';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token';

export const REFRESH_COOKIE = 'plantcare_rt';
const MAX_SESSIONS_PER_USER = 5;

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/auth',
};

const setRefreshCookie = (res: Response, token: string): void => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const maxAge = decoded?.exp ? decoded.exp * 1000 - Date.now() : 7 * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_COOKIE, token, { ...baseCookieOptions, maxAge });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  
  const user = await User.create({ name, email, password, role: UserRole.USER });

  sendSuccess(res, 201, 'Account created successfully', { user });
};










// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select('+password');
  // Same message for "no user" and "wrong password" so attackers can't probe for emails
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokenHashes: { $each: [hashToken(refreshToken)], $slice: -MAX_SESSIONS_PER_USER } } }
  );

  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, 'Login successful', { user, accessToken });
};





// POST /api/auth/refresh 
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
  if (!token) {
    throw new AppError('Refresh token missing', 401);
  }

  let userId: string;
  try {
    userId = verifyRefreshToken(token).sub;
  } catch {
    clearRefreshCookie(res);
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(userId).select('+refreshTokenHashes');
  if (!user) {
    clearRefreshCookie(res);
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const oldHash = hashToken(token);
  if (!user.refreshTokenHashes.includes(oldHash)) {
   




    await User.updateOne({ _id: user._id }, { $set: { refreshTokenHashes: [] } });
    clearRefreshCookie(res);
    throw new AppError('Refresh token reuse detected. Please log in again.', 401);
  }

  const newRefreshToken = signRefreshToken(user);
  await User.updateOne({ _id: user._id }, { $pull: { refreshTokenHashes: oldHash } });
  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokenHashes: { $each: [hashToken(newRefreshToken)], $slice: -MAX_SESSIONS_PER_USER } } }
  );

  setRefreshCookie(res, newRefreshToken);
  sendSuccess(res, 200, 'Token refreshed', { user, accessToken: signAccessToken(user) });
};












// POST /api/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];

  if (token) {
    try {
      const { sub } = verifyRefreshToken(token);
      await User.updateOne({ _id: sub }, { $pull: { refreshTokenHashes: hashToken(token) } });
    } catch {
     
    }
  }

  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logged out');
};




// GET /api/auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.sub);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  sendSuccess(res, 200, 'Success', { user });
};
