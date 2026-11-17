import type { Request, Response } from 'express';
import { CareTask, type ICareTask } from '../models/careTask.model';
import { Notification } from '../models/notification.model';
import { Plant } from '../models/plant.model';
import { CareType, RecurrenceUnit, TaskStatus } from '../types/enums';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { nextDueDate } from '../utils/dates';

const PLANT_FIELDS = 'name species imageUrl';

const TITLE_VERBS: Record<CareType, string> = {
  [CareType.WATERING]: 'Water',
  [CareType.FERTILIZING]: 'Fertilize',
  [CareType.PRUNING]: 'Prune',
};

interface RecurrenceBody {
  unit?: RecurrenceUnit;
  interval?: number;
}

// Only these fields can be set by the client (never `owner`, `status`, `completedAt`)
const pickTaskFields = (body: Record<string, unknown>) => {
  const recurrence = (body.recurrence ?? {}) as RecurrenceBody;
  return {
    plant: body.plant,
    type: body.type as CareType,
    title: typeof body.title === 'string' ? body.title.trim() : '',
    notes: body.notes || undefined,
    dueDate: body.dueDate,
    recurrence: {
      unit: recurrence.unit ?? RecurrenceUnit.NONE,
      interval: recurrence.interval ?? 1,
    },
  };
};

// A task can only be attached to one of the logged-in user's own plants.
// Returns the plant so we can build a default title from its name.
const getOwnedPlant = async (plantId: unknown, userId: string | undefined) => {
  const plant = await Plant.findOne({ _id: plantId, owner: userId }).select('name');
  if (!plant) {
    throw new AppError('Plant not found', 404);
  }
  return plant;
};

// "Water Kitchen Monstera" when the user leaves the title empty
const withTitle = <T extends { title: string; type: CareType }>(fields: T, plantName: string): T => ({
  ...fields,
  title: fields.title || `${TITLE_VERBS[fields.type]} ${plantName}`.slice(0, 100),
});

// Every query filters by `owner`, so users can never see or change someone else's tasks.
// A task that belongs to another user looks exactly like a missing one (404).
const findOwnedTask = async (req: Request): Promise<ICareTask> => {
  const task = await CareTask.findOne({ _id: req.params.id, owner: req.user?.sub });
  if (!task) {
    throw new AppError('Care task not found', 404);
  }
  return task;
};

// GET /api/care-tasks?view=upcoming|overdue|pending|completed|all&plant=&type=&page=&limit=
// Returns the page of tasks plus `counts` for the tabs on the Care Schedule page.
export const listTasks = async (req: Request, res: Response): Promise<void> => {
  const { view, type, plant } = req.query as { view?: string; type?: string; plant?: string };
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const now = new Date();

  // Filters shared by the list and the tab counts
  const base: Record<string, unknown> = { owner: req.user?.sub };
  if (plant) base.plant = plant;
  if (type) base.type = type;

  // overdue = still pending and the due date has passed; upcoming = pending and still ahead
  const filter: Record<string, unknown> = { ...base };
  let sort: Record<string, 1 | -1> = { dueDate: -1 };

  switch (view) {
    case 'upcoming':
      filter.status = TaskStatus.PENDING;
      filter.dueDate = { $gte: now };
      sort = { dueDate: 1 };
      break;
    case 'overdue':
      filter.status = TaskStatus.PENDING;
      filter.dueDate = { $lt: now };
      sort = { dueDate: 1 };
      break;
    case 'pending':
      filter.status = TaskStatus.PENDING;
      sort = { dueDate: 1 };
      break;
    case 'completed':
      filter.status = TaskStatus.COMPLETED;
      sort = { completedAt: -1 };
      break;
    default:
      break; // "all"
  }

  const [tasks, total, upcoming, overdue, completed, all] = await Promise.all([
    CareTask.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('plant', PLANT_FIELDS),
    CareTask.countDocuments(filter),
    CareTask.countDocuments({ ...base, status: TaskStatus.PENDING, dueDate: { $gte: now } }),
    CareTask.countDocuments({ ...base, status: TaskStatus.PENDING, dueDate: { $lt: now } }),
    CareTask.countDocuments({ ...base, status: TaskStatus.COMPLETED }),
    CareTask.countDocuments(base),
  ]);

  sendSuccess(res, 200, 'Success', {
    tasks,
    counts: { upcoming, overdue, completed, total: all },
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
};

// POST /api/care-tasks
export const createTask = async (req: Request, res: Response): Promise<void> => {
  const fields = pickTaskFields(req.body as Record<string, unknown>);
  const plant = await getOwnedPlant(fields.plant, req.user?.sub);

  const task = await CareTask.create({ ...withTitle(fields, plant.name), owner: req.user?.sub });
  await task.populate('plant', PLANT_FIELDS);

  sendSuccess(res, 201, 'Care task created', { task });
};

// GET /api/care-tasks/:id
export const getTask = async (req: Request, res: Response): Promise<void> => {
  const task = await findOwnedTask(req);
  await task.populate('plant', PLANT_FIELDS);
  sendSuccess(res, 200, 'Success', { task });
};

// PUT /api/care-tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const task = await findOwnedTask(req);
  if (task.status === TaskStatus.COMPLETED) {
    throw new AppError('Completed tasks cannot be edited', 409);
  }

  const fields = pickTaskFields(req.body as Record<string, unknown>);
  const plant = await getOwnedPlant(fields.plant, req.user?.sub);

  task.set(withTitle(fields, plant.name));
  await task.save();
  await task.populate('plant', PLANT_FIELDS);

  sendSuccess(res, 200, 'Care task updated', { task });
};

// DELETE /api/care-tasks/:id  (also removes the reminders created for it)
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const task = await findOwnedTask(req);

  await Notification.deleteMany({ task: task._id });
  await task.deleteOne();

  sendSuccess(res, 200, 'Care task deleted');
};

// PATCH /api/care-tasks/:id/complete
// Marks the task done. If it repeats, the next occurrence is created automatically.
export const completeTask = async (req: Request, res: Response): Promise<void> => {
  // Atomic: only a task that is still pending can be completed, so a double click
  // (or two devices) can never complete it twice or create two "next" tasks.
  const task = await CareTask.findOneAndUpdate(
    { _id: req.params.id, owner: req.user?.sub, status: TaskStatus.PENDING },
    { $set: { status: TaskStatus.COMPLETED, completedAt: new Date() } },
    { new: true }
  );

  if (!task) {
    const exists = await CareTask.exists({ _id: req.params.id, owner: req.user?.sub });
    throw exists
      ? new AppError('This task is already completed', 409)
      : new AppError('Care task not found', 404);
  }

  let nextTask: ICareTask | null = null;
  if (task.recurrence.unit !== RecurrenceUnit.NONE) {
    nextTask = await CareTask.create({
      owner: task.owner,
      plant: task.plant,
      type: task.type,
      title: task.title,
      notes: task.notes,
      dueDate: nextDueDate(task.dueDate, task.recurrence.unit, task.recurrence.interval),
      recurrence: { unit: task.recurrence.unit, interval: task.recurrence.interval },
    });
    await nextTask.populate('plant', PLANT_FIELDS);
  }

  await task.populate('plant', PLANT_FIELDS);
  sendSuccess(res, 200, 'Task completed', { task, nextTask });
};
