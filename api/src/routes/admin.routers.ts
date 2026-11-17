import { Router } from 'express';
import { deleteUser, getStats, listUsers, updateUserRole } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { UserRole } from '../types/enums';
import { adminRoleRules, adminUserIdRule, adminUserListRules } from '../validators/admin.validators';

const router = Router();

// Logged in AND role === admin for every route here
router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/stats', getStats);
router.get('/users', adminUserListRules, validate, listUsers);
router.patch('/users/:id/role', adminUserIdRule, adminRoleRules, validate, updateUserRole);
router.delete('/users/:id', adminUserIdRule, validate, deleteUser);

export default router;
