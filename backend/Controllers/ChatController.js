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
        const result = await chat.sendMessage(`Answer in moderate way (max 6 lines): ${lastUser}`);
        return res.json({ reply: result.response.text() });
    }catch(e){
        console.log("Chat Error:",e);
        return res.status(500).json({ reply: "Server error. Try again." });
    }
};

export default chat;