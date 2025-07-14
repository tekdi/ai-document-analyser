import express from 'express';
import fs from 'fs';
import path from 'path';

// Import and clear in-memory caches from other modules if needed
import { analysisCache } from './analyze.js';
import { documentTypesCache } from '../config.js';

const router = express.Router();

const CACHE_DIR = path.resolve('server', 'cache');

router.post('/', (req, res) => {
  // Clear in-memory cache
  if (analysisCache && typeof analysisCache === 'object') {
    Object.keys(analysisCache).forEach(key => delete analysisCache[key]);
  }

  // Clear document types cache
  if (documentTypesCache && typeof documentTypesCache === 'object') {
    Object.keys(documentTypesCache).forEach(key => delete documentTypesCache[key]);
  }

  // Clear filesystem cache
  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    });
  }

  res.json({ status: 'ok', message: 'All caches cleared.' });
});

export default router;