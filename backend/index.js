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

const app = express(); // initliaze

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "*"],
    // remove credentials: true if using origin: "*" or handle it dynamically
  })
);

app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// router
app.use("/auth", AuthRouter);

app.use("/chat", ChatRouter);

app.use("/analyze", AnalyzeRouter);

app.use("/quiz", QuizRouter);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
