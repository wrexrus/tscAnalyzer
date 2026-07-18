import QuizResult from "../Models/QuizResult.js";
import AnalysisHistory from "../Models/AnalysisHistory.js";
import { getGeminiModel, generateWithRetry } from "../Services/GeminiService.js";

// converts raw quiz DB records into a compact per-topic summary.
const extractQuizInsights = (results) => {
  const topicMap = {};

  results.forEach(r => {
    const topic = r.topic || "General";
    if (!topicMap[topic]) topicMap[topic] = { totalScore: 0, totalQs: 0, attempts: 0, category: r.category };
    topicMap[topic].totalScore += r.score;
    topicMap[topic].totalQs   += r.totalQuestions;
    topicMap[topic].attempts  += 1;
  });

  // Convert to array sorted by average score ascending (worst first)
  return Object.entries(topicMap)
    .map(([topic, stats]) => ({
      topic,
      category: stats.category,
      avgPct: Math.round((stats.totalScore / stats.totalQs) * 100),
      attempts: stats.attempts
    }))
    .sort((a, b) => a.avgPct - b.avgPct);
};

// Converts raw analysis/optimize DB records into compact mistake + topic signals.
const extractCodeInsights = (records) => {
  const mistakeFreq = {};
  const topicCount  = {};

  records.forEach(r => {
    const topic = r.topic && r.topic !== "Unknown" ? r.topic : null;
    if (topic) topicCount[topic] = (topicCount[topic] || 0) + 1;

    if (Array.isArray(r.mistakes)) {
      r.mistakes.forEach(m => {
        mistakeFreq[m] = (mistakeFreq[m] || 0) + 1;
      });
    }
  });

  // Top 6 most repeated mistakes, sorted by frequency
  const topMistakes = Object.entries(mistakeFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([mistake, count]) => `"${mistake}" (${count}×)`);

  // Top topics by session count
  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => `${topic} (${count}×)`);

  return { topMistakes, topTopics };
};

// main function — reads both data sources, builds prompt, calls Gemini,
// returns structured { roadmap, dataUsed }.
export const learningRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;

    // Promise.all: Both DB queries are independent. Running them in parallel
    const [quizResults, codeRecords] = await Promise.all([
      QuizResult.find({ user: userId }).sort({ createdAt: -1 }).limit(30),
      AnalysisHistory.find({ user: userId, actionType: { $in: ['analyze', 'optimize'] } })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('topic mistakes actionType')   // select: fetch only the fields we actually use
    ]);

    if (quizResults.length === 0 && codeRecords.length === 0) {
      return res.status(200).json({
        roadmap: null,
        message: "Complete at least a few quizzes or code analyses to generate a personalised roadmap."
      });
    }

    const quizInsights = extractQuizInsights(quizResults);
    const codeInsights = extractCodeInsights(codeRecords);

    const dataUsed = {
      quizSessions:    quizResults.length,
      codeSessions:    codeRecords.length,
      topMistakes:     codeInsights.topMistakes,
      weakestTopics:   quizInsights.slice(0, 3).map(t => `${t.topic} (${t.avgPct}%)`),
    };

    //build the compact insight string sent to Gemini 
    const quizSummary = quizInsights.length > 0
      ? quizInsights.map(t => `${t.topic}: ${t.avgPct}% avg (${t.attempts} attempts)`).join(", ")
      : "No quiz data yet.";

    const mistakeSummary = codeInsights.topMistakes.length > 0
      ? codeInsights.topMistakes.join(", ")
      : "No code mistakes recorded yet.";

    const topicSummary = codeInsights.topTopics.length > 0
      ? codeInsights.topTopics.join(", ")
      : "No code topics recorded yet.";

    const prompt = `You are an expert computer science tutor building a personalised 7-day DSA and coding learning roadmap.

Student data:
QUIZ PERFORMANCE (worst first): ${quizSummary}
RECURRING CODE MISTAKES: ${mistakeSummary}
TOPICS CODED IN: ${topicSummary}

Generate a 7-day roadmap that:
- Targets the student's WEAKEST quiz topics and most REPEATED code mistakes
- Alternates between theory days, coding practice days, and quiz practice days
- Is specific and actionable — not generic advice
- Focuses on Data Structures, Algorithms, and code efficiency

Return ONLY a valid JSON array of exactly 7 objects. No markdown, no explanation outside the JSON.
Each object must have EXACTLY these keys:
{
  "day": <number 1-7>,
  "topic": "<specific topic name>",
  "focus": "<one of: theory | code | practice>",
  "why": "<1-2 sentences: why this topic was chosen for this student specifically>",
  "task": "<specific actionable task for the day>",
  "practiceHint": "<where/how to practice: quiz suggestion, LeetCode problem number, or coding exercise>",
  "complexityGoal": "<the complexity insight to understand or achieve today>"
}`;

    const model  = getGeminiModel();
    const result = await generateWithRetry(model, prompt);
    const text   = result.response.text();

    // parse Gemini's JSON response
    // two-step coz, Gemini sometimes wraps JSON in ```json fences despite instructions.
    let roadmap;
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      roadmap = JSON.parse(jsonMatch[0]);
    } else {
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      roadmap = JSON.parse(cleaned);
    }

    // Validate: must be an array of 7 objects with required keys
    if (!Array.isArray(roadmap) || roadmap.length !== 7) {
      throw new Error("Gemini returned invalid roadmap structure.");
    }

    res.status(200).json({ roadmap, dataUsed });

  } catch (error) {
    console.error("Error generating learning roadmap:", error);
    if (error.status === 503) {
      return res.status(503).json({ error: "The AI model is busy. Please try again in a moment." });
    }
    res.status(500).json({ error: "Failed to generate roadmap. Please try again." });
  }
};

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
    Based on their weaknesses, provide a highly structured, actionable learning plan formatted in Markdown.
    
    Include exactly these sections:
    ### 🎯 Focus Area For Today
    (Identify their weakest topic or highest time complexity and explain exactly WHY they should focus on it).
    
    ### 💡 Quick Tip
    (Provide a 2-sentence actionable rule of thumb related to their focus area, e.g., 'If you see nested loops, think Hash Map').

    Keep the entire response encouraging and under 150 words.
    
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
