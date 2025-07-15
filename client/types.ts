export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
}

export type RfpSummary = {
  [key: string]: string;
};

export interface AnalysisResult {
  summary: RfpSummary;
  scopeOfWork: string;
  penalties: string;
  scoringCriteria: string;
}

export type AppStatus = 'idle' | 'processing' | 'analyzing' | 'ready' | 'error';
