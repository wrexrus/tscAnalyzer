export const ConvertStrategy = {
    getPrompt: (code, targetLanguage) => `You are an expert polyglot developer. Translate the following code exactly into ${targetLanguage}.
        Maintain the same logic, but use idiomatic ${targetLanguage} conventions.
        Start your response with the translated code inside a markdown block.
        
        Code to convert:
        ${code}`,

    isValidResponse: (responseText) => {
        return !responseText.includes("Error:");
    },

    formatDbPayload: (userId, responseText, code, targetLanguage) => {
        return {
            user: userId,
            actionType: 'convert',
            explanation: responseText,
            topic: targetLanguage // save the language, converted to as the topic
        };
    }
};
