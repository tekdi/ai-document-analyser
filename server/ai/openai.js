import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

export default {
  async generate({ model, prompt, systemInstruction, history }) {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    if (history && Array.isArray(history)) {
      messages.push(...history);
    }
    messages.push({ role: 'user', content: prompt });

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.1,
      top_p: 0.9,
    });
    return response.choices[0].message.content.trim();
  }
};