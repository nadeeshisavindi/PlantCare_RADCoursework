import type { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

// GET /api/notifications?unread=true&page=&limit=  (only the logged-in user's own)
export const listNotifications = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!.sub;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filter: { user: string; isRead?: boolean } = { user };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user, isRead: false }),
  ]);

  sendSuccess(res, 200, 'Notifications', {
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
};

// GET /api/notifications/unread-count  (cheap call used by the sidebar badge)
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  const unreadCount = await Notification.countDocuments({ user: req.user!.sub, isRead: false });
  sendSuccess(res, 200, 'Unread count', { unreadCount });
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.sub },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  sendSuccess(res, 200, 'Marked as read', { notification });
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  await Notification.updateMany({ user: req.user!.sub, isRead: false }, { isRead: true, readAt: new Date() });
  sendSuccess(res, 200, 'All marked as read');
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  const result = await Notification.deleteOne({ _id: req.params.id, user: req.user!.sub });
  if (result.deletedCount === 0) throw new AppError('Notification not found', 404);
  sendSuccess(res, 200, 'Notification deleted');
};
