import { Router } from 'express';
import authController from '../controllers/auth/authController.js';
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify', authController.verify);

export default router;