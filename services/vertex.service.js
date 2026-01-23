import { generativeModel } from '../config/vertex.js';
import logger from '../utils/logger.js';

export const askVertex = async (prompt, context = null) => {
    try {
        let finalPrompt = prompt;

        // Combine context with prompt if available
        if (context) {
            finalPrompt = `CONTEXT:\n${context}\n\nUSER QUESTION:\n${prompt}`;
        }

        logger.info(`[VERTEX] Sending request to Gemini (Context: ${!!context})...`);

        const result = await generativeModel.generateContent(finalPrompt);
        const response = await result.response;

        let text = '';
        if (typeof response.text === 'function') {
            text = response.text();
        } else if (response.candidates && response.candidates.length > 0) {
            text = response.candidates[0].content.parts[0].text;
        } else {
            logger.warn(`[VERTEX] Unexpected response format: ${JSON.stringify(response)}`);
            text = "No response generated.";
        }

        logger.info(`[VERTEX] Response received successfully (${text.length} chars).`);
        return text;

    } catch (error) {
        logger.error(`[VERTEX] Error: ${error.message}`);
        throw error;
    }
};
