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
