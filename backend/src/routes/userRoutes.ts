import { Router } from 'express';
import { getUnapprovedUsers, approveUser, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/unapproved', getUnapprovedUsers);
router.patch('/:id/approve', approveUser);
router.patch('/profile', authenticate, updateProfile);

export default router;
