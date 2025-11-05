# RFP Analyser AI

An intelligent application that allows users to upload Request for Proposal (RFP) documents and ask questions about their content using multiple AI providers.

## Quick Start

**Prerequisites:** Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   # Optional: add other providers if needed
   OPENAI_API_KEY=your_openai_key  
   CLAUDE_API_KEY=your_claude_key
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

The app will be available at http://localhost:8080

## Environment Variables

- `GEMINI_API_KEY` (required) - Default AI provider
- `OPENAI_API_KEY` (optional) - For GPT models  
- `CLAUDE_API_KEY` (optional) - For Claude models
- `PORT` (optional) - Server port, defaults to 8080

## Screenshots

<img width="1280" height="688" alt="Screenshot 2025-11-05 at 3 13 39 PM" src="https://github.com/user-attachments/assets/1e3b43aa-ff5f-4917-9b0f-b0339e4b7b20" />
<img width="1280" height="689" alt="Screenshot 2025-11-05 at 3 23 17 PM" src="https://github.com/user-attachments/assets/a2e0e8b1-4f24-4e62-b94b-d5fa609198c6" /><img width="1280" height="688" alt="Screenshot 2025-11-05 at 3 23 24 PM" src="https://github.com/user-attachments/assets/1ce8e23b-ebbd-4db0-b47e-bfc0a766fedc" />



