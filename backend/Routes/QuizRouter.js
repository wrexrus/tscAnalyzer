import express from "express";
import { ensureAuthenticated } from "../Middlewares/Auth.js";
import { generateQuestions, saveResult, myProgress, aiReview, learningRoadmap, learnConcept } from "../Controllers/QuizController.js";

const router = express.Router();

router.post("/generate-questions", generateQuestions);
router.post("/save-result", ensureAuthenticated, saveResult);
router.get("/my-progress", ensureAuthenticated, myProgress);
router.get("/ai-review", ensureAuthenticated, aiReview);

router.get("/learning-roadmap", ensureAuthenticated, learningRoadmap);

router.get("/learn-concept", learnConcept);

export default router;