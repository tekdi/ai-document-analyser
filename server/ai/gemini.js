import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export default {
  async generate({ model, prompt, systemInstruction }) {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        topP: 0.9,
        topK: 32,
      },
    });
    return response.text;
  }
};