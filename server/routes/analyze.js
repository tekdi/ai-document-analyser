import express from 'express';
import { getDocumentType } from '../config.js';
import { getProvider } from '../ai/provider.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// In-memory cache: { [hash]: result }
const analysisCache = {};

// Filesystem cache directory (ensure this exists or create it)
const CACHE_DIR = path.resolve('server', 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function getCacheFilePath(cacheKey) {
  return path.join(CACHE_DIR, `${cacheKey}.json`);
}

function readCache(cacheKey) {
  // Try in-memory first
  if (analysisCache[cacheKey]) return analysisCache[cacheKey];
  // Then try filesystem
  const filePath = getCacheFilePath(cacheKey);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      analysisCache[cacheKey] = data; // hydrate memory cache
      return data;
    } catch (e) {
      // Ignore parse errors, treat as cache miss
    }
  }
  return null;
}

function writeCache(cacheKey, data) {
  analysisCache[cacheKey] = data;
  const filePath = getCacheFilePath(cacheKey);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  } catch (e) {
    // Ignore write errors
  }
}

router.post('/', async (req, res) => {
  const { documentText, documentType, modelId, sections } = req.body;
  if (!documentText || !documentType || !modelId) {
    return res.status(400).json({ error: 'documentText, documentType, and modelId are required.' });
  }

  const docConfig = getDocumentType(documentType);
  if (!docConfig) return res.status(400).json({ error: 'Invalid document type' });

  const provider = getProvider(modelId);

  // Only process requested sections (or all if not specified)
  const requestedSections = Array.isArray(sections) && sections.length > 0
    ? docConfig.sections.filter(s => sections.includes(s.key))
    : docConfig.sections;

  // Cache key includes requested sections
  const cacheKey = getHash(documentText + '|' + getHash(JSON.stringify(docConfig)) + '|' + modelId + '|' + JSON.stringify(sections || []));

  const noCache = req.header('cache-control') && req.header('cache-control').toLowerCase().includes('no-cache');
  if (!noCache) {
    const cached = readCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  }

  const analysisResult = {};
  try {
    // Process summary and non-summary sections concurrently
    const summarySection = requestedSections.find(s => s.key === 'summary' && s.topics);
    const otherSections = requestedSections.filter(s => s.key !== 'summary' || !s.topics);

    const promises = [];

    // Handle summary section with batched questions
    if (summarySection) {
      const summaryPromise = (async () => {
        // Create structured prompt combining all summary questions
        const questionsText = summarySection.topics.map((topic, index) => 
          `${index + 1}. ${topic.label} (${topic.key}): ${topic.prompt}`
        ).join('\n');

        const batchedPrompt = `Please extract the following information from the RFP document and respond in JSON format. For each field, cite the page number(s) where you found the information. If not found, use "Not specified".

Questions:
${questionsText}

Document:
---
${documentText}
---

Please respond with a JSON object where each key corresponds to the topic key in parentheses above, and each value is your answer with page citations.`;

        const response = await provider.generate({
          model: modelId,
          prompt: batchedPrompt,
          systemInstruction: `${summarySection.prompt} Respond only with valid JSON. For each answer, cite page numbers where found. If not found, say "Not specified".`
        });

        // Parse JSON response
        try {
          const parsedSummary = JSON.parse(response);
          analysisResult.summary = parsedSummary;
        } catch (parseError) {
          console.error('Failed to parse summary JSON response:', parseError);
          console.error('Response was:', response);
          
          // Fallback: use the raw response as a single summary
          analysisResult.summary = { combined: response };
        }
      })();
      promises.push(summaryPromise);
    }

    // Handle other sections concurrently
    const otherPromises = otherSections.map(async (section) => {
      const prompt = `${section.prompt}\n\nDocument:\n---\n${documentText}\n---`;
      const result = await provider.generate({
        model: modelId,
        prompt,
        systemInstruction: `Extract the following information and cite page numbers. If not found, say "Not specified".`
      });
      return { key: section.key, result };
    });
    promises.push(...otherPromises);

    // Wait for all sections to complete
    const results = await Promise.all(promises);
    
    // Process non-summary results
    results.forEach(result => {
      if (result && typeof result === 'object' && result.key) {
        analysisResult[result.key] = result.result;
      }
    });
    writeCache(cacheKey, analysisResult);
    res.json(analysisResult);
  } catch (error) {
    console.error("AI call failed during analysis:", error);
    res.status(500).json({ error: "Failed to extract information from the AI model." });
  }
});

export default router;