import { Router } from 'express';
import userController from '../controllers/user/userController.js';
const router = Router();

router.get('/:id', userController.get);

export default router;