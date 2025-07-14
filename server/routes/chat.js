import express from 'express';
import { getDocumentType } from '../config.js';
import { getProvider } from '../ai/provider.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { documentText, documentType, modelId, question, history } = req.body;
  if (!documentText || !documentType || !modelId || !question) {
    return res.status(400).json({ error: 'documentText, documentType, modelId, and question are required.' });
  }

  const docConfig = getDocumentType(documentType);
  if (!docConfig) return res.status(400).json({ error: 'Invalid document type' });

  const provider = getProvider(modelId);

  const systemPrompt = docConfig.chatConfiguration?.systemPrompt || 'You are an expert document analyst.';

  const prompt = `Question: ${question}\n\nDocument:\n---\n${documentText}\n---`;

  try {
    const answer = await provider.generate({
      model: modelId,
      prompt,
      systemInstruction: systemPrompt,
      history,
    });
    res.json({ answer });
  } catch (error) {
    console.error("AI call failed during chat:", error);
    res.status(500).json({ error: "Failed to get a response from the AI model." });
  }
});

export default router;