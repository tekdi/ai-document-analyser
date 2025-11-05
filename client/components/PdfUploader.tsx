import React, { useCallback, useRef, useState, useEffect } from 'react';
import type { AppStatus } from '../types';
import { UploadIcon, FileIcon, CheckCircleIcon, SpinnerIcon, ErrorIcon } from './icons';

interface PdfUploaderProps {
  onFileUpload: (file: File, docType: string, modelId: string) => void;
  status: AppStatus;
  fileName: string;
  error: string;
}

type Model = {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  default: boolean;
};

type DocumentType = {
  type: string;
  displayName: string;
  sections: any[];
};

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onFileUpload, status, fileName, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Fetch document types from API on mount
  useEffect(() => {
    fetch('/api/document-types')
      .then(res => res.json())
      .then((data: DocumentType[]) => {
        setDocumentTypes(data);
        if (data.length > 0) {
          setSelectedType(data[0].type);
        }
      })
      .catch(() => setDocumentTypes([]));
  }, []);

  // Fetch models from API on mount
  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then((data: Model[]) => {
        setModels(data);
        const defaultModel = data.find(m => m.default) || data[0];
        setSelectedModel(defaultModel?.id || '');
      })
      .catch(() => setModels([]));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileUpload(event.target.files[0], selectedType, selectedModel);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const allowedTypes = ["application/pdf", "text/plain", "text/csv", "text/markdown"];
      const file = files[0];
      const fileExtension = file.name.toLowerCase().split('.').pop();

      if (allowedTypes.includes(file.type) || ['md', 'txt', 'csv'].includes(fileExtension || '')) {
        onFileUpload(file, selectedType, selectedModel);
      }
    }
  }, [onFileUpload, handleDragEvents, selectedType, selectedModel]);

  const isDisabled = status === 'processing' || status === 'analyzing';

  const getStatusContent = () => {
    if (status === 'error') {
      return (
        <div className="text-center text-red-500 flex flex-col items-center space-y-2">
          <ErrorIcon />
          <span className="font-semibold">Upload Failed</span>
          <p className="text-xs text-red-400 max-w-xs mx-auto">{error}</p>
        </div>
      );
    }
    if (status === 'processing') {
      return (
        <div className="text-center text-blue-500 flex flex-col items-center space-y-2">
          <SpinnerIcon />
          <span className="font-semibold">Processing Document...</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{fileName}</p>
        </div>
      );
    }
    if (status === 'analyzing') {
        return (
          <div className="text-center text-blue-500 flex flex-col items-center space-y-2">
            <SpinnerIcon />
            <span className="font-semibold">Analyzing with AI...</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{fileName}</p>
          </div>
        );
      }
    if (status === 'ready') {
       return (
        <div className="text-center text-green-500 flex flex-col items-center space-y-2">
          <CheckCircleIcon />
          <span className="font-semibold">Analysis Ready</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <FileIcon className="w-4 h-4" />
            <span>{fileName}</span>
          </p>
        </div>
      );
    }
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 flex flex-col items-center space-y-2">
        <UploadIcon />
        <span className="font-semibold">Drag & drop a document here</span>
        <span className="text-xs">PDF, TXT, CSV, or MD files supported</span>
      </div>
    );
  };
  
  const borderColor = isDragging ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600';
  const bgColor = isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-700/50';

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Upload Document</h2>
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[110px]">
            Document Type
          </label>
          <select
            className="flex-1 p-1 rounded border border-slate-300 dark:bg-slate-700 dark:text-white"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            disabled={isDisabled || documentTypes.length === 0}
          >
            <option value="" disabled>Select Document Type</option>
            {documentTypes.map(dt => (
              <option key={dt.type} value={dt.type}>{dt.displayName}</option>
            ))}
            <option value="auto" disabled>Auto</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[110px]">
            Model
          </label>
          <select
            className="flex-1 p-1 rounded border border-slate-300 dark:bg-slate-700 dark:text-white"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            disabled={isDisabled || models.length === 0}
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div 
        className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed ${borderColor} ${bgColor} rounded-lg p-6 transition-colors duration-200 ease-in-out`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          {getStatusContent()}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.txt,.csv,.md,text/plain,text/csv,text/markdown"
          className="hidden"
          onChange={handleFileChange}
          disabled={isDisabled}
        />
      </div>
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
      >
        {status === 'ready' || status === 'error' ? 'Upload Another Document' : 'Select Document File'}
      </button>
    </div>
  );
};
