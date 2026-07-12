import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Models/db.js";
import AuthRouter from "./Routes/AuthRouter.js";
import ChatRouter from "./Routes/ChatRouter.js";
import AnalyzeRouter from "./Routes/AnalyzeRouter.js";
import QuizRouter from "./Routes/QuizRouter.js";
import AstRouter from "./Routes/AstRouter.js";
import rateLimit from "express-rate-limit";
import errorHandler from "./Middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// router
app.use("/auth", AuthRouter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});

app.use("/chat", apiLimiter, ChatRouter);
app.use("/analyze", apiLimiter, AnalyzeRouter);
app.use("/ast", apiLimiter, AstRouter);
app.use("/quiz", apiLimiter, QuizRouter);

// Global Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
