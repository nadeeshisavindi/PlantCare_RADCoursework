import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CareTask } from '../models/careTask.model';
import { Notification } from '../models/notification.model';
import { Plant } from '../models/plant.model';
import { User } from '../models/user.model';
import { CareType, TaskStatus, UserRole } from '../types/enums';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/admin/stats - system-wide numbers for the dashboard cards
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const [users, admins, plants, tasks, completed, overdue, byType] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: UserRole.ADMIN }),
    Plant.countDocuments(),
    CareTask.countDocuments(),
    CareTask.countDocuments({ status: TaskStatus.COMPLETED }),
    CareTask.countDocuments({ status: TaskStatus.PENDING, dueDate: { $lt: now } }),
    CareTask.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
  ]);

  const tasksByType: Record<string, number> = {
    [CareType.WATERING]: 0,
    [CareType.FERTILIZING]: 0,
    [CareType.PRUNING]: 0,
  };
  byType.forEach((row) => {
    tasksByType[row._id] = row.count;
  });

  sendSuccess(res, 200, 'Admin stats', {
    stats: { users, admins, plants, tasks, completed, overdue, tasksByType },
  });
};

// GET /api/admin/users?q=&page=&limit= - users with how many plants/tasks each owns
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const filter = q
    ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { email: new RegExp(escapeRegex(q), 'i') }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const ids = users.map((u) => u._id);
  const [plantCounts, taskCounts] = await Promise.all([
    Plant.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { owner: { $in: ids } } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]),
    CareTask.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { owner: { $in: ids } } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]),
  ]);
  const plantMap = new Map(plantCounts.map((r) => [String(r._id), r.count]));
  const taskMap = new Map(taskCounts.map((r) => [String(r._id), r.count]));

  const items = users.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    plantCount: plantMap.get(String(u._id)) ?? 0,
    taskCount: taskMap.get(String(u._id)) ?? 0,
  }));

  sendSuccess(res, 200, 'Users', {
    users: items,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
};

// PATCH /api/admin/users/:id/role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  if (id === req.user?.sub) throw new AppError('You cannot change your own role', 400);

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  user.role = req.body.role as UserRole;
  user.refreshTokenHashes = []; // force re-login so the new role takes effect
  await user.save();

  sendSuccess(res, 200, 'Role updated', {
    user: { _id: String(user._id), name: user.name, email: user.email, role: user.role },
  });
};

// DELETE /api/admin/users/:id - removes the user and everything they own
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  if (id === req.user?.sub) throw new AppError('You cannot delete your own account', 400);

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  await Promise.all([
    Notification.deleteMany({ user: user._id }),
    CareTask.deleteMany({ owner: user._id }),
    Plant.deleteMany({ owner: user._id }),
  ]);
  await user.deleteOne();

  sendSuccess(res, 200, 'User deleted');
};
