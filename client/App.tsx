import React, { useState, useCallback } from 'react';
import { PdfUploader } from './components/PdfUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import analysisService from './services/analysisService';
import type { Message, AnalysisResult, AppStatus } from './types';
import { MessageAuthor } from './types';
import { HeaderIcon, SpinnerIcon } from './components/icons';
import { documentTypes } from './documentConfigs';

// Make pdfjsLib available globally from CDN scripts in index.html
declare const pdfjsLib: any;

export default function App(): React.ReactNode {
  const [pdfText, setPdfText] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>('idle');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState(documentTypes[0].type);
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  const handlePdfUpload = useCallback(async (file: File, docType: string, modelId: string) => {
    setStatus('processing');
    setError('');
    setPdfText('');
    setPdfName(file.name);
    setMessages([]);
    setAnalysisResult(null);
    setSelectedDocType(docType);
    setSelectedModelId(modelId);

    try {
      if (typeof pdfjsLib === 'undefined') {
        throw new Error('pdf.js library is not loaded. Please check your internet connection and refresh.');
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
            setError('Failed to read file.');
            setStatus('error');
            return;
        }

        try {
          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullTextWithPageNumbers = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullTextWithPageNumbers += `--- Page ${i} ---\n${pageText}\n\n`;
          }
          setPdfText(fullTextWithPageNumbers);
          setStatus('analyzing');

          try {
            const result = await analysisService.extractRfpDetails(fullTextWithPageNumbers, docType, modelId);
            setAnalysisResult(result);
            setMessages([
              {
                id: 'initial-ai-message',
                author: MessageAuthor.AI,
                text: `Successfully analyzed "${file.name}". Key details have been extracted with page references. You can review them in the tabs or ask me specific questions.`,
              },
            ]);
            setStatus('ready');
          } catch(e: any) {
             console.error("Error from backend API during analysis:", e);
             setError(e.message || 'Failed to analyze the RFP with the AI service. The document might be too complex or a server error occurred.');
             setStatus('error');
          }

        } catch (e) {
          console.error("Error parsing PDF:", e);
          setError('Could not process the PDF file. It might be corrupted or in an unsupported format.');
          setStatus('error');
        }
      };
      fileReader.onerror = () => {
        setError('Error reading the file.');
        setStatus('error');
      }
      fileReader.readAsArrayBuffer(file);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred during PDF processing.');
      setStatus('error');
    }
  }, []);

  const handleQuestionSubmit = useCallback(async (question: string) => {
    if (!question.trim() || isAnswering || !pdfText) return;

    const userMessage: Message = { id: Date.now().toString(), author: MessageAuthor.USER, text: question };
    setMessages(prev => [...prev, userMessage]);
    setIsAnswering(true);
    setError('');

    try {
      const answer = await analysisService.answerQuestion(pdfText, question);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), author: MessageAuthor.AI, text: answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e: any) {
      console.error("Error from backend API:", e);
      const errorMessage = e.message || 'Sorry, I encountered an error while trying to answer. Please try again.';
      const aiErrorMessage: Message = { id: (Date.now() + 1).toString(), author: MessageAuthor.AI, text: errorMessage };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsAnswering(false);
    }
  }, [pdfText, isAnswering]);

  const renderContent = () => {
    if (status === 'ready' && analysisResult) {
      return (
        <AnalysisDisplay
          analysisResult={analysisResult}
          messages={messages}
          onQuestionSubmit={handleQuestionSubmit}
          isAnswering={isAnswering}
          isReady={status === 'ready'}
          docType={selectedDocType}
          documentText={pdfText}
          modelId={selectedModelId}
        />
      );
    }

    const idleText = "Ready for analysis. Please upload an RFP document to begin.";
    const processingText = `Processing "${pdfName}"...`;
    const analyzingText = `Analyzing "${pdfName}" with AI... This may take a moment.`;
    
    let message = idleText;
    if (status === 'processing') message = processingText;
    if (status === 'analyzing') message = analyzingText;
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-6">
            {(status === 'processing' || status === 'analyzing') && <SpinnerIcon />}
            <p className="mt-4 text-lg">{message}</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-screen font-sans text-slate-800 dark:text-slate-200">
      <header className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <HeaderIcon />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">RFP Analyser AI</h1>
        </div>
      </header>
      
      <main className="flex-grow grid md:grid-cols-12 gap-6 p-6 overflow-hidden">
        <div className="md:col-span-4 lg:col-span-3 flex flex-col space-y-6">
          <PdfUploader 
            onFileUpload={handlePdfUpload}
            status={status}
            fileName={pdfName}
            error={error}
          />
        </div>
        
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}