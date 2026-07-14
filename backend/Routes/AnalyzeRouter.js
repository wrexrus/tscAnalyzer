import express from 'express'
import { analyze, myHistory, aiReview } from '../Controllers/AnalyzeController.js';
import { ensureAuthenticated } from '../Middlewares/Auth.js';
import { validateAnalyzeRequest } from '../Middlewares/Validation.js';

const router = express.Router();

// Middleware 1 - validateAnalyzeRequest (blocks invalid data)
router.post('/', validateAnalyzeRequest, analyze);
router.get("/my-history", ensureAuthenticated, myHistory);
router.get("/ai-review", ensureAuthenticated, aiReview);

export default router;