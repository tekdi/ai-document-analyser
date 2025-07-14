import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.CLAUDE_API_KEY;
const anthropic = new Anthropic({ apiKey });

export default {
  async generate({ model, prompt, systemInstruction, history }) {
    let messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    if (history && Array.isArray(history)) {
      messages.push(...history);
    }
    messages.push({ role: 'user', content: prompt });

    const response = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      messages,
      temperature: 0.1,
      top_p: 0.9,
    });
    return response.content[0].text.trim();
  }
};