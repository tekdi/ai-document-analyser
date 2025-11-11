import { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CopyButtonProps {
  content: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ content, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
      title={label}
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
