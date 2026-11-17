import { Router } from 'express';
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../controllers/careTask.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  careTaskBodyRules,
  careTaskIdRule,
  careTaskListRules,
} from '../validators/careTask.validators';

const router = Router();

// Every care-task route requires a valid access token
router.use(authenticate);

router.get('/', careTaskListRules, validate, listTasks);
router.post('/', careTaskBodyRules, validate, createTask);
router.get('/:id', careTaskIdRule, validate, getTask);
router.put('/:id', careTaskIdRule, careTaskBodyRules, validate, updateTask);
router.delete('/:id', careTaskIdRule, validate, deleteTask);
router.patch('/:id/complete', careTaskIdRule, validate, completeTask);

export default router;
