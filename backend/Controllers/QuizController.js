import QuizResult from "../Models/QuizResult.js";
import { getGeminiModel, generateWithRetry } from "../Services/GeminiService.js";

export const generateQuestions = async (req, res) => {
  const { topic, difficulty } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ error: "Topic and difficulty are required." });
  }

  try {
    const model = getGeminiModel();
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

    const result = await generateWithRetry(model, prompt);
    const text = result.response.text();
    
    let questions;
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      questions = JSON.parse(jsonMatch[0]);
    } else {
      const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      questions = JSON.parse(cleanedText);
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    if (error.status === 503) {
      return res.status(503).json({ error: "The AI model is currently experiencing high demand. Please wait a moment and try again!" });
    }
    res.status(500).json({ error: "Failed to generate questions. Please try again." });
  }
};

export const saveResult = async (req, res) => {
  try {
    const { category, topic, difficulty, score, totalQuestions } = req.body;
    const newResult = new QuizResult({
      user: req.user._id,
      category,
      topic,
      difficulty,
      score,
      totalQuestions
    });
    await newResult.save();
    res.status(201).json({ message: "Quiz result saved successfully." });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Failed to save result." });
  }
};

export const myProgress = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Failed to fetch progress." });
  }
};

export const aiReview = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    if (results.length === 0) {
      return res.status(200).json({ review: "You haven't taken any quizzes yet! Complete a few quizzes to get an AI review of your progress." });
    }

    const dataString = results.map(r => `Topic: ${r.topic} (${r.category}, ${r.difficulty}) - Score: ${r.score}/${r.totalQuestions}`).join("\n");
    
    const model = getGeminiModel();
    const prompt = `You are an expert computer science tutor. Analyze the following recent quiz results for a student. 
    Identify their strongest data structures/algorithms and pinpoint exactly where they need to improve. 
    Keep it encouraging and strictly under 5 sentences.
    
    Data:
    ${dataString}`;

    const result = await generateWithRetry(model, prompt);
    res.status(200).json({ review: result.response.text() });
  } catch (error) {
    console.error("Error generating AI review:", error);
    if (error.status === 503) {
      return res.status(503).json({ error: "The AI model is currently experiencing high demand. Please wait a moment and try again!" });
    }
    res.status(500).json({ error: "Failed to generate AI review." });
  }
};
