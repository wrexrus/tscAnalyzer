import { getGeminiModel, sendMessageWithRetryStream } from "../Services/GeminiService.js";


const chat = async (req,res)=>{
    try{
        const { messages = [] } = req.body;
        const history = messages
        .filter((m) => m.role === "user")
        .slice(-10)
        .map((m)=>({
            role: "user", parts: [ { text: m.content } ]
        }));
        const model = getGeminiModel();
        const chat = model.startChat({ history });
        const lastUser = history[history.length - 1]?.parts?.[0]?.text || "";
        const systemPrompt = `You are a strict tutor. You must ONLY answer questions related to Data Structures, Algorithms (DSA), or Time/Space Complexity. If the user's question is NOT related to these topics, you MUST reply exactly with: "Please ask Question related to DSA or complexities". Keep all valid answers moderate (max 6 lines). User question: ${lastUser}`;
        const resultStream = await sendMessageWithRetryStream(chat, systemPrompt);
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    }catch(e){
        console.log("Chat Error:", e);
        if (e.status === 503) {
            res.write(`data: ${JSON.stringify({ text: "The AI model is currently experiencing high demand. Please wait a moment and try again!" })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
        }
        res.write(`data: ${JSON.stringify({ text: "Server error. Try again." })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
    }
};

export default chat;