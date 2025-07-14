import express from 'express';
import { getDocumentTypes } from '../config.js';
import { getProvider } from '../ai/provider.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { documentText, modelId } = req.body;
  if (!documentText || !modelId) {
    return res.status(400).json({ error: 'documentText and modelId are required.' });
  }

  const provider = getProvider(modelId);
  const docTypes = Object.values(getDocumentTypes());

  const docTypeList = docTypes.map(dt => `- ${dt.displayName} (${dt.type})`).join('\n');
  const prompt = `Given the following document, identify its type from this list:\n${docTypeList}\n\nDocument:\n---\n${documentText}\n---\nRespond with the identifier only.`;

  try {
    const detectedType = await provider.generate({
      model: modelId,
      prompt,
      systemInstruction: 'Identify the document type.',
    });
    res.json({ documentType: detectedType.trim() });
  } catch (error) {
    console.error("AI call failed during document type detection:", error);
    res.status(500).json({ error: "Failed to detect document type." });
  }
});

export default router;