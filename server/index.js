import express from 'express';
//import { loadConfig, getDocumentTypes, getModels } from './config.js';
import analyzeRouter from './routes/analyze.js';
import chatRouter from './routes/chat.js';
import detectTypeRouter from './routes/detectType.js';
import modelsRouter from './routes/models.js';
import documentTypesRouter from './routes/documentTypes.js';
import healthRouter from './routes/health.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/detect-type', detectTypeRouter);
app.use('/api/models', modelsRouter);
app.use('/api/document-types', documentTypesRouter);
app.use('/api/health', healthRouter);

// Serve static files
app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});