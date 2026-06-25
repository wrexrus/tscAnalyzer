import express from "express";
import { ensureAuthenticated } from "../Middlewares/Auth.js";
import { generateQuestions, saveResult, myProgress, aiReview } from "../Controllers/QuizController.js";

const router = express.Router();

router.post("/generate-questions", generateQuestions);
router.post("/save-result", ensureAuthenticated, saveResult);
router.get("/my-progress", ensureAuthenticated, myProgress);
router.get("/ai-review", ensureAuthenticated, aiReview);

export default router;