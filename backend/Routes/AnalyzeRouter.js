import express from 'express'
import AnalyzeController from '../Controllers/AnalyzeController.js';

const router = express.Router();

router.post('/analyze',AnalyzeController);

export default router;