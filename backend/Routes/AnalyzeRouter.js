import express from 'express'
import { analyze, myHistory, aiReview } from '../Controllers/AnalyzeController.js';
import { ensureAuthenticated } from '../Middlewares/Auth.js';

const router = express.Router();

router.post('/', analyze);
router.get("/my-history", ensureAuthenticated, myHistory);
router.get("/ai-review", ensureAuthenticated, aiReview);

export default router;