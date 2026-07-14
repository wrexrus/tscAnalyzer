export const TestStrategy = {
    getPrompt: (code) => `You are a strict technical interviewer. Based on the following code, generate 3 thought-provoking questions to test the user's understanding of what they just wrote.
        Do NOT provide the answers. Just the questions. Make them challenging.
        
        Code:
        ${code}`,

    isValidResponse: (responseText) => {
        return !responseText.includes("Error:");
    },

    formatDbPayload: (userId, responseText, code, targetLanguage) => {
        return {
            user: userId,
            actionType: 'test',
            explanation: responseText
        };
    }
};
