import jwt from 'jsonwebtoken';
import AnalysisHistory from '../Models/AnalysisHistory.js';
import { getGeminiModel, generateWithRetryStream } from '../Services/GeminiService.js';

const analyze = async (req,res)=>{
    try{
        const { code } = req.body;
        if(!code) return res.status(400).json({
            error: "No code provided",
        });
        const model = getGeminiModel();
        const prompt = 
            `Analyze the following code.
            If the code contains syntax errors, is completely invalid, or is not programming code, return EXACTLY this structure:
            Error: <describe the syntax errors or explain why it is wrong>

            Otherwise, if it is valid code, return the exact structure:
            Language: <Programming Language>
            Time Complexity: <Big-O>
            Space Complexity: <Big-O>
            Topic: <Main topic or data structure, e.g., Arrays, Graph, Sorting>
            Difficulty: <Easy, Medium, or Hard>
            Why: <6-7 line explanation with only relevant points>

            Code to analyze:
            ${code}`;
        const payload = { contents: [{ role: "user",parts: [{ text: prompt }] }] };
        const resultStream = await generateWithRetryStream(model, payload);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Tell express to flush headers immediately
        if(res.flushHeaders) res.flushHeaders();

        let responseText = "";
        
        for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            responseText += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();

        // Background save
        const authHeader = req.headers['authorization'];
        let userId = null;
        if (authHeader) {
          try {
             const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
             userId = decoded._id;
          } catch(e) {}
        }

        const isError = responseText.includes("Error:");
        const isMissingFields = !responseText.includes("Language:") || !responseText.includes("Time Complexity:");

        if (userId && responseText && !isError && !isMissingFields) {
           const langMatch = responseText.match(/Language:\s*(.*)/i);
           const timeMatch = responseText.match(/Time Complexity:\s*(.*)/i);
           const spaceMatch = responseText.match(/Space Complexity:\s*(.*)/i);
           const topicMatch = responseText.match(/Topic:\s*(.*)/i);
           const difficultyMatch = responseText.match(/Difficulty:\s*(.*)/i);
           
           try {
             await AnalysisHistory.create({
                user: userId,
                language: langMatch ? langMatch[1].trim() : "Unknown",
                timeComplexity: timeMatch ? timeMatch[1].trim() : "Unknown",
                spaceComplexity: spaceMatch ? spaceMatch[1].trim() : "Unknown",
                topic: topicMatch ? topicMatch[1].trim() : "Unknown",
                difficulty: difficultyMatch ? difficultyMatch[1].trim() : "Unknown",
                explanation: responseText
             });
           } catch (dbErr) {
             console.log("Failed to save analysis history:", dbErr);
           }
        }
    }catch(error){
        console.log("Error:",error);
        if (error.status === 503) {
            return res.status(503).json({ error: "The AI model is currently experiencing high demand. Please wait a moment and try again!" });
        }
        return res.status(500).json({ error: "Internal Server error" });
    }
};

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

    const dataString = history.map(h => `Language: ${h.language} | Time: ${h.timeComplexity} | Topic: ${h.topic || 'Unknown'} | Difficulty: ${h.difficulty || 'Unknown'}`).join("\n");
    
    const model = getGeminiModel();
    const prompt = `You are an expert computer science tutor. Analyze the following recent coding history for a student. 
    Note the languages they use, the topics they practice, their difficulty level, and their average time complexities. 
    Provide 1 specific, actionable tip on how they can write more optimal code or what topics they should practice next based on their weaknesses.
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

export { analyze };