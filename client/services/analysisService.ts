import type { AnalysisResult } from '../types';

async function handleApiResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return response.json();
}

const analysisService = {
    async answerQuestion(rfpText: string, question: string): Promise<string> {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rfpText, question }),
            });
            const data = await handleApiResponse(response);
            return data.answer;
        } catch (error) {
            console.error("API call failed during question answering:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to get a response from the AI service.");
        }
    },

    async extractRfpDetails(documentText: string, documentType: string, modelId: string) {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentText, documentType, modelId }),
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }
};

export default analysisService;
