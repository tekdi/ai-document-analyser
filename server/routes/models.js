import express from 'express';
import { getModels } from '../config.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getModels());
});

export default router;