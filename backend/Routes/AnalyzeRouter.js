import express from 'express'
import AnalyzeController from '../Controllers/AnalyzeController.js';

const router = express.Router();

router.post('/',AnalyzeController);

export default router;