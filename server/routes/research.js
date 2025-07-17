import express from 'express';
import { getProvider } from '../ai/provider.js';

const router = express.Router();

/**
 * POST /api/research
 * Body: {
 *   documentText: string,
 *   modelId: string,
 *   questions: string[]
 * }
 */
router.post('/', async (req, res) => {
  const { documentText, modelId, questions } = req.body;
  if (!documentText || !modelId || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'documentText, modelId, and a non-empty questions array are required.' });
  }

  const provider = getProvider(modelId);

  try {
    // For each question, ask the model to answer using both the document and external knowledge
    const answers = {};
    for (const question of questions) {
      const prompt = `
You are an expert research assistant. 
Given the following document and the research question, answer as best as possible using both the document and your external knowledge. 
If the answer is not in the document, use your own up-to-date knowledge and cite sources if possible.

Document:
---
${documentText}
---

Research Question:
${question}
`;
      const answer = await provider.generate({
        model: modelId,
        prompt,
        systemInstruction: "Answer the research question using both the document and your own knowledge. If you use external knowledge, cite your sources if possible.",
      });
      answers[question] = answer;
    }
    res.json({ answers });
  } catch (error) {
    console.error("AI call failed during research:", error);
    res.status(500).json({ error: "Failed to get research answers from the AI model." });
  }
});

export default router;