import express from 'express';
import { getDocumentTypes } from '../config.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Object.values(getDocumentTypes()));
});

export default router;