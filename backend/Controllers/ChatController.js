import { GoogleGenerativeAI } from "@google/generative-ai";


const chat = async (req,res)=>{
    try{
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const { messages = [] } = req.body;
        const history = messages
        .filter((m) => m.role === "user")
        .slice(-10)
        .map((m)=>({
            role: "user", parts: [ { text: m.content } ]
        }));
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({ history });
        const lastUser = history[history.length - 1]?.parts?.[0]?.text || "";
        const systemPrompt = `You are a strict tutor. You must ONLY answer questions related to Data Structures, Algorithms (DSA), or Time/Space Complexity. If the user's question is NOT related to these topics, you MUST reply exactly with: "Please ask Question related to DSA or complexities". Keep all valid answers moderate (max 6 lines). User question: ${lastUser}`;
        const result = await chat.sendMessage(systemPrompt);
        return res.json({ reply: result.response.text() });
    }catch(e){
        console.log("Chat Error:", e);
        if (e.status === 503) {
            return res.status(503).json({ reply: "The AI model is currently experiencing high demand. Please wait a moment and try again!" });
        }
        return res.status(500).json({ reply: "Server error. Try again." });
    }
};

export default chat;