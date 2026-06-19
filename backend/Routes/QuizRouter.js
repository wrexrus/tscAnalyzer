import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Route to generate questions
router.post("/generate-questions", async (req, res) => {
  const { topic, difficulty } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ error: "Topic and difficulty are required." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a computer science quiz generator.
Generate exactly 10 ${difficulty} level multiple-choice questions on the topic: ${topic}.
Return ONLY a raw JSON array of objects. Do not include any markdown formatting like \`\`\`json.
Schema for each object:
{
  "text": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "Brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Safely extract JSON array from the response in case Gemini adds conversational text
    let questions;
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      questions = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: try cleaning markdown blocks and parsing directly
      const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      questions = JSON.parse(cleanedText);
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions. Please try again." });
  }
});

export default router;