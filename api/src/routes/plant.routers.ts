import { Router } from 'express';
import {
  createPlant,
  deletePlant,
  getPlant,
  listPlants,
  updatePlant,
} from '../controllers/plant.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { plantBodyRules, plantIdRule, plantListRules } from '../validators/plant.validators';

const router = Router();


router.use(authenticate);

router.get('/', plantListRules, validate, listPlants);
router.post('/', plantBodyRules, validate, createPlant);
router.get('/:id', plantIdRule, validate, getPlant);
router.put('/:id', plantIdRule, plantBodyRules, validate, updatePlant);
router.delete('/:id', plantIdRule, validate, deletePlant);

export default router;
