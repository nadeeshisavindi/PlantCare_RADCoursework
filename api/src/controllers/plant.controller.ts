import type { Request, Response } from 'express';
import { CareTask } from '../models/careTask.model';
import { Notification } from '../models/notification.model';
import { Plant, type IPlant } from '../models/plant.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';


const pickPlantFields = (body: Record<string, unknown>) => ({
  name: body.name,
  species: body.species,
  imageUrl: body.imageUrl || undefined,
  description: body.description || undefined,
  plantingDate: body.plantingDate,
  location: body.location || undefined,
  careInfo: body.careInfo ?? {},
});

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
  planted: { plantingDate: -1 },
};


const findOwnedPlant = async (req: Request): Promise<IPlant> => {
  const plant = await Plant.findOne({ _id: req.params.id, owner: req.user?.sub });
  if (!plant) {
    throw new AppError('Plant not found', 404);
  }
  return plant;
};



// GET /api/plants
export const listPlants = async (req: Request, res: Response): Promise<void> => {
  const { q, light, sort } = req.query as { q?: string; light?: string; sort?: string };
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const filter: Record<string, unknown> = { owner: req.user?.sub };
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { species: pattern }, { location: pattern }];
  }
  if (light) {
    filter['careInfo.light'] = light;
  }

  const [plants, total] = await Promise.all([
    Plant.find(filter)
      .sort(SORTS[sort ?? 'newest'])
      .skip((page - 1) * limit)
      .limit(limit),
    Plant.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Success', {
    plants,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
};



// POST /api/plants
export const createPlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await Plant.create({
    ...pickPlantFields(req.body as Record<string, unknown>),
    owner: req.user?.sub,
  });
  sendSuccess(res, 201, 'Plant added successfully', { plant });
};

// GET /api/plants/:id
export const getPlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await findOwnedPlant(req);
  sendSuccess(res, 200, 'Success', { plant });
};

// PUT /api/plants/:id
export const updatePlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await findOwnedPlant(req);
  plant.set(pickPlantFields(req.body as Record<string, unknown>));
  await plant.save(); 
  sendSuccess(res, 200, 'Plant updated successfully', { plant });
};

// DELETE /api/plants/id 
export const deletePlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await findOwnedPlant(req);

  await Promise.all([
    CareTask.deleteMany({ plant: plant._id }),
    Notification.deleteMany({ plant: plant._id }),
  ]);
  await plant.deleteOne();

  sendSuccess(res, 200, 'Plant deleted successfully');
};
