
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { MessageAuthor } from '../types';
import { SendIcon, UserIcon, AiIcon, SpinnerIcon } from './icons';

interface ChatInterfaceProps {
  messages: Message[];
  onQuestionSubmit: (question: string) => void;
  isAnswering: boolean;
  isReady: boolean;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <AiIcon />
        </div>
      )}
      <div 
        className={`max-w-xl rounded-lg px-4 py-3 shadow-sm ${isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onQuestionSubmit, isAnswering, isReady }) => {
  const [question, setQuestion] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAnswering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && isReady && !isAnswering) {
      onQuestionSubmit(question);
      setQuestion('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isAnswering && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <AiIcon />
            </div>
            <div className="max-w-xl rounded-lg px-4 py-3 shadow-sm bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <SpinnerIcon />
              <span className="text-sm">Analysing...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={isReady ? 'Type your question here...' : 'Upload a PDF to start asking questions'}
            disabled={!isReady || isAnswering}
            className="flex-grow w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Ask a question about the RFP"
          />
          <button
            type="submit"
            disabled={!isReady || isAnswering || !question.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            aria-label="Send question"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};
