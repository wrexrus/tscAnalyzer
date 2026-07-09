import express from 'express';
import { optimize } from '../Controllers/OptimizeController.js';

const router = express.Router();

router.post('/', optimize);

export default router;
