/**
 prompt now asks Gemini to include two structured machine-readable lines at the top:
  Topic: <topic>
  bottlenecks: <item1> | <item2> | <item3>
 */
export const OptimizeStrategy = {
    getPrompt: (code) => `You are an expert Senior Software Engineer reviewing code.

First, output these two machine-readable lines (required):
Topic: <the main programming topic or data structure of this code, e.g. Sorting, Graph, Arrays>
Bottlenecks: <bottleneck 1> | <bottleneck 2> | <bottleneck 3>

Then provide your full review in markdown:

**Performance Bottlenecks:**
(Explain each bottleneck in detail)

**Optimized Code:**
(Provide the refactored code in a code block)

**Why It's Better:**
(Explain the improvements briefly)

Code to optimize:
${code}`,

    isValidResponse: (responseText) => {
        return !responseText.startsWith("Error:");
    },

    formatDbPayload: (userId, responseText, code, targetLanguage) => {
        const topicMatch       = responseText.match(/^Topic:\s*(.+)/im);
        const bottleneckMatch  = responseText.match(/^Bottlenecks:\s*(.+)/im);

        const parsedBottlenecks = bottleneckMatch
            ? bottleneckMatch[1].split('|').map(b => b.trim()).filter(Boolean)
            : [];

        return {
            user: userId,
            actionType: 'optimize',
            topic:   topicMatch ? topicMatch[1].trim() : 'Unknown',
            mistakes: parsedBottlenecks,   // stored in `mistakes[]` field 
            explanation: responseText       // full AI response still stored for the expand card
        };
    }
};
