export const OptimizeStrategy = {
    getPrompt: (code) => `You are an expert Senior Software Engineer reviewing code.
        Identify all performance bottlenecks and bad practices in the following code.
        Provide the optimized, refactored code and briefly explain why it is better.
        Start your response with:
        **Performance Bottlenecks:**
        
        Code to optimize:
        ${code}`,

    isValidResponse: (responseText) => {
        return !responseText.includes("Error:");
    },

    formatDbPayload: (userId, responseText, code, targetLanguage) => {
        return {
            user: userId,
            actionType: 'optimize',
            explanation: responseText
        };
    }
};
