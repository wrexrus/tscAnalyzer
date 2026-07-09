import { getGeminiModel, generateWithRetryStream } from '../Services/GeminiService.js';

const optimize = async (req,res)=>{
    try{
        const { code } = req.body;
        if(!code) return res.status(400).json({
            error: "No code provided",
        });
        
        const model = getGeminiModel();
        const prompt = 
            `You are an expert code optimizer. Analyze the following code.
            If the code contains syntax errors, is completely invalid, or is not programming code, return EXACTLY this structure:
            Error: <describe the syntax errors or explain why it is wrong>

            Otherwise, if it is valid code, analyze it and provide a concise optimization plan.
            - Keep the theory short and sweet (maximum 3-4 sentences).
            - Use bullet points for readability to point out inefficiencies.
            - Provide the optimized pseudocode (or actual optimized code) clearly formatted.
            Keep your response incredibly clean and easy to read. Do not echo the original code back to the user.

            Code to optimize:
            ${code}`;

        const payload = { contents: [{ role: "user",parts: [{ text: prompt }] }] };
        const resultStream = await generateWithRetryStream(model, payload);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        if(res.flushHeaders) res.flushHeaders();

        for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();

    }catch(error){
        console.log("Error in Optimization:", error);
        if (error.status === 503) {
            return res.status(503).json({ error: "The AI model is currently experiencing high demand. Please wait a moment and try again!" });
        }
        return res.status(500).json({ error: "Internal Server error" });
    }
};

export { optimize };
