import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { documentTypes } from './src/documentConfigs.ts'; // adjust path as needed

// --- Server Setup ---
const app = express();
const port = process.env.PORT || 8080;

// Use express.json middleware with an increased payload limit for large PDF text bodies.
app.use(express.json({ limit: '50mb' }));

// --- Gemini AI Setup ---
const model = 'gemini-2.5-flash';
let ai;

try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY environment variable not set.");
        throw new Error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey });
    console.log("GoogleGenAI initialized successfully.");
} catch (e) {
    console.error("Failed to initialize GoogleGenAI:", e.message);
    // If AI setup fails, the server can't function. Exit gracefully.
    process.exit(1); 
}


// --- API Endpoints ---

// POST /api/extract
app.post('/api/extract', async (req, res) => {
    const { pdfText, docType } = req.body;

    if (!pdfText || !docType) {
        return res.status(400).json({ error: 'PDF text and document type are required.' });
    }

    const config = documentTypes.find(dt => dt.type === docType);
    if (!config) return res.status(400).json({ error: 'Invalid document type' });

    const analysisResult = {};

    try {
        for (const section of config.sections) {
            if (section.key === 'summary' && section.topics) {
                analysisResult.summary = {};
                for (const topic of section.topics) {
                    const userContent = `Summary Topic: ${topic.label}\nPrompt: ${topic.prompt}\n\nDocument:\n---\n${pdfText}\n---`;
                    const response = await ai.models.generateContent({
                        model: model,
                        contents: userContent,
                        config: {
                            systemInstruction: `${section.prompt} For each, cite the page number(s) where you found the information. If not found, say "Not specified".`,
                            temperature: 0.1,
                            topP: 0.9,
                            topK: 32,
                        },
                    });
                    analysisResult.summary[topic.label] = response.text;
                }
            } else {
                const userContent = `Section: ${section.label}\nPrompt: ${section.prompt}\n\nDocument:\n---\n${pdfText}\n---`;
                const response = await ai.models.generateContent({
                    model: model,
                    contents: userContent,
                    config: {
                        systemInstruction: `You are an expert at analysing ${config.displayName}s. For this section, extract the relevant information from the document and cite page numbers.`,
                        temperature: 0.1,
                        topP: 0.9,
                        topK: 32,
                    },
                });
                analysisResult[section.key] = response.text;
            }
        }
        res.json(analysisResult);
    } catch (error) {
        console.error("Gemini API call failed during extraction:", error);
        res.status(500).json({ error: "Failed to extract information from the AI model." });
    }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
    const { rfpText, question } = req.body;

    if (!rfpText || !question) {
        return res.status(400).json({ error: 'RFP text and question are required.' });
    }

    const systemInstruction = `You are an expert at analysing Software Development RFPs. The user has provided an RFP document where each page is marked with '--- Page X ---'. You should answer the questions based on the provided document only. When you answer, you MUST cite the page number(s) from the document where you found the information. For example, '... as mentioned on Page 5.' or 'This is detailed on Pages 8-10.'. If the document does not have an answer, you should say so. Be concise and helpful.`;

    const userContent = `Based on the provided RFP document, answer the following question: "${question}"\n\nHere is the RFP document for context:\n\n---\n${rfpText}\n---`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userContent,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.1,
                topP: 0.9,
                topK: 32,
            },
        });
        
        res.json({ answer: response.text });
    } catch (error) {
        console.error("Gemini API call failed during question answering:", error);
        res.status(500).json({ error: "Failed to get a response from the AI model." });
    }
});

// Serve static files from the project's root directory. This must come *after* the API routes.
app.use(express.static('dist'));

// --- Server Start ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});