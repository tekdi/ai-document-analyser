# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RFP Analyser AI is a document analysis application that allows users to upload RFP (Request for Proposal) documents and ask questions about their content. The system uses multiple AI providers (Gemini, OpenAI, Claude) for intelligent document processing and analysis.

## Architecture

**Frontend (client/)**
- React/TypeScript application built with Vite
- Main components: `PdfUploader`, `AnalysisDisplay`, `ChatInterface`
- Uses PDF.js (via CDN) for client-side PDF text extraction
- State management through React hooks in `App.tsx`
- Document type configurations in `client/documentConfigs.ts`
- **Sequential section loading**: Frontend loads document sections one at a time (initially just summary + first section) rather than processing all sections at once. This improves user experience by providing faster initial results, though it increases LLM API usage.

**Backend (server/)**
- Express.js API server with modular route structure
- AI provider abstraction layer in `server/ai/` supporting:
  - Gemini (default): `server/ai/gemini.js`
  - OpenAI: `server/ai/openai.js` 
  - Claude: `server/ai/claude.js`
- Dynamic provider selection via model ID prefixes in `server/ai/provider.js`
- Document type definitions in `server/documentTypes/` (JSON configs)
- Available models configured in `server/models.json`
- Response caching system in `server/cache/`

**Key API Endpoints:**
- `/api/analyze` - Document analysis with AI
- `/api/chat` - Question answering
- `/api/detect-type` - Document type detection
- `/api/models` - Available AI models
- `/api/document-types` - Document type configurations
- `/api/research` - Research functionality

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (client + server)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Setup

Required environment variables:
- `GEMINI_API_KEY` - Google Gemini API key (set in .env.local)
- Optional: OpenAI and Anthropic API keys for additional providers

## Document Types System

Document types are configured in `server/documentTypes/*.json` with structured sections and prompts. The RFP type includes specialized sections like:
- Summary extraction with specific business fields
- Bid submission planning
- Scope of work analysis
- Evaluation criteria assessment
- Terms and conditions parsing

Each document type defines:
- Section keys and labels
- Analysis prompts for AI processing
- Business-specific extraction topics

## AI Provider Integration

The system automatically routes to appropriate AI providers based on model ID:
- `gemini*` → Gemini provider
- `gpt*` → OpenAI provider  
- `claude*` → Claude provider

New providers can be added by:
1. Creating provider implementation in `server/ai/`
2. Adding to provider registry in `server/ai/provider.js`
3. Adding model configs to `server/models.json`

## Response Caching

Analysis results are cached in `server/cache/` using content hashing to avoid redundant AI API calls for identical document content.