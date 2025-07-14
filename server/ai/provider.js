import geminiProvider from './gemini.js';
import openaiProvider from './openai.js';
import claudeProvider from './claude.js';

const providers = {
  gemini: geminiProvider,
  openai: openaiProvider,
  claude: claudeProvider,
};

export function getProvider(modelId) {
  if (modelId.startsWith('gemini')) return providers.gemini;
  if (modelId.startsWith('gpt')) return providers.openai;
  if (modelId.startsWith('claude')) return providers.claude;
  throw new Error('Unknown model provider');
}