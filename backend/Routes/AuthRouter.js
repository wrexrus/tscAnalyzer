import express from 'express';
import { login, signup, googleAuth } from '../Controllers/AuthController.js';
import { loginValidation, signupValidation } from '../Middlewares/AuthValidation.js';

const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/google', googleAuth);

export default router;