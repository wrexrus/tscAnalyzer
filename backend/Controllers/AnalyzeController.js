import jwt from 'jsonwebtoken';
import AnalysisHistory from '../Models/AnalysisHistory.js';
import { getGeminiModel, generateWithRetryStream, generateWithRetry } from '../Services/GeminiService.js';
import asyncHandler from '../Middlewares/asyncHandler.js';
import { getStrategy } from '../Services/AnalyzeStrategies/StrategyFactory.js';


const analyze = asyncHandler(async (req, res, next) => {
    const { code, mode = 'analyze', targetLanguage = 'Python' } = req.body;

    let userId = null;
    if (req.headers.authorization) {
        try {
            const decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
            userId = decoded._id;
        } catch (err) {
            console.log("Token verification failed in analyze");
        }
    }

    const strategy = getStrategy(mode);

    const prompt = strategy.getPrompt(code, targetLanguage);

    const model = getGeminiModel();
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    const resultStream = await generateWithRetryStream(model, payload);

    // Server-Sent Events (SSE) to stream the response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Prevents proxy buffering on deployed platforms like Vercel/Render
    if (res.flushHeaders) res.flushHeaders();

    let responseText = "";
    for await (const chunk of resultStream.stream) {
        const chunkText = chunk.text();
        responseText += chunkText;
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();

    if (userId && responseText && strategy.isValidResponse(responseText)) {
        const dbPayload = strategy.formatDbPayload(userId, responseText, code, targetLanguage);
        
        try {
            // Save the new analysis record
            await AnalysisHistory.create(dbPayload);

            // rolling Cap: keep max 50 records per user 
            // without a cap, a power user could store thousands of records,
            // bloating the DB and slowing every query
            
            const totalRecords = await AnalysisHistory.countDocuments({ user: userId });
            const MAX_RECORDS  = 50;

            if (totalRecords > MAX_RECORDS) {
                // Find oldest records that are beyond the limit and delete them
                const overflow = totalRecords - MAX_RECORDS;
                const oldest = await AnalysisHistory
                    .find({ user: userId })
                    .sort({ createdAt: 1 })  // ascending = oldest first
                    .limit(overflow)
                    .select('_id');          // only fetch IDs — no need for full docs

                const oldestIds = oldest.map(doc => doc._id);
                await AnalysisHistory.deleteMany({ _id: { $in: oldestIds } });
            }
        } catch (dbErr) {
            console.log("Failed to save analysis history:", dbErr);
        }
    }
});

export const myHistory = async (req, res) => {
  try {
    const history = await AnalysisHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
};

export const aiReview = async (req, res) => {
  try {
    const history = await AnalysisHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    if (history.length === 0) {
      return res.status(200).json({ review: "You haven't analyzed any code yet! Analyze some code to get personalized feedback on your coding habits." });
    }

    const dataString = history.map(h => `Topic: ${h.topic || 'Unknown'} | Time: ${h.timeComplexity} | Mistakes: ${(h.mistakes || []).join(', ')}`).join("\n");
    
    const model = getGeminiModel();
    const prompt = `You are an expert computer science tutor. Analyze the following recent coding history for a student. 
    Based on their weaknesses, provide a highly structured, actionable learning plan formatted in Markdown.
    
    Include exactly these sections:
    ###  Focus Area For Today
    (Identify their weakest topic or highest time complexity and explain exactly WHY they should focus on it).
    
    ###  Quick Tip
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

export { analyze };