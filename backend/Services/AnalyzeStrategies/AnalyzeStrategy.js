
// Handles the logic for the "Analyze" tool mode.

export const AnalyzeStrategy = {
    getPrompt: (code) => `You are a Unified AI Code Engine. Analyze and optimize the following code.
        If the code contains syntax errors, is completely invalid, or is not programming code, return EXACTLY this structure:
        Error: <describe the syntax errors or explain why it is wrong>

        Otherwise, if it is valid code, return the exact structure (use exactly these labels):
        Language: <Programming Language>
        Time Complexity: <Big-O>
        Space Complexity: <Big-O>
        Topic: <Main topic or data structure, e.g., Arrays, Graph, Sorting>
        Difficulty: <Easy, Medium, or Hard>
        Developer Level: <Beginner, Intermediate, or Pro>
        Mistakes: <Mistake 1> | <Mistake 2> | <Mistake 3> (separate with pipe |)
        Optimization: <Provide 2-3 sentences of optimization strategy>
        Why: <3-4 sentences explaining the core logic>

        Code to analyze:
        ${code}`,

    isValidResponse: (responseText) => {
        const isError = responseText.includes("Error:");
        const isMissingFields = !responseText.includes("Language:") || !responseText.includes("Time Complexity:");
        return !isError && !isMissingFields;
    },

    formatDbPayload: (userId, responseText, code, targetLanguage) => {
        const langMatch = responseText.match(/Language:\s*(.*)/i);
        const timeMatch = responseText.match(/Time Complexity:\s*(.*)/i);
        const spaceMatch = responseText.match(/Space Complexity:\s*(.*)/i);
        const topicMatch = responseText.match(/Topic:\s*(.*)/i);
        const difficultyMatch = responseText.match(/Difficulty:\s*(.*)/i);
        const devLevelMatch = responseText.match(/Developer Level:\s*(.*)/i);
        const mistakesMatch = responseText.match(/Mistakes:\s*(.*)/i);
        const optMatch = responseText.match(/Optimization:\s*([\s\S]*?)Why:/i);

        let parsedMistakes = [];
        if (mistakesMatch) {
            parsedMistakes = mistakesMatch[1].split('|').map(m => m.trim()).filter(m => m);
        }

        return {
            user: userId,
            actionType: 'analyze',
            explanation: responseText,
            language: langMatch ? langMatch[1].trim() : "Unknown",
            timeComplexity: timeMatch ? timeMatch[1].trim() : "Unknown",
            spaceComplexity: spaceMatch ? spaceMatch[1].trim() : "Unknown",
            topic: topicMatch ? topicMatch[1].trim() : "Unknown",
            difficulty: difficultyMatch ? difficultyMatch[1].trim() : "Unknown",
            developerLevel: devLevelMatch ? devLevelMatch[1].trim() : "Unknown",
            mistakes: parsedMistakes,
            optimization: optMatch ? optMatch[1].trim() : ""
        };
    }
};
