import React, { useState, useEffect } from 'react';
import type { AnalysisResult, Message } from '../types';
import { ChatInterface } from './ChatInterface';
import { ListChecksIcon, ClipboardListIcon, AlertTriangleIcon, MessageSquareIcon } from './icons';
import ReactMarkdown from 'react-markdown';

interface AnalysisDisplayProps {
    analysisResult: AnalysisResult;
    messages: Message[];
    onQuestionSubmit: (question: string) => void;
    isAnswering: boolean;
    isReady: boolean;
    docType: string;
}

type SectionConfig = {
    key: string;
    label: string;
    prompt: string;
    topics?: { key: string; label: string; prompt: string }[];
};

type DocumentTypeConfig = {
    type: string;
    displayName: string;
    sections: SectionConfig[];
};

const iconMap: Record<string, React.FC> = {
    summary: ListChecksIcon,
    scopeOfWork: ClipboardListIcon,
    penalties: AlertTriangleIcon,
    scoringCriteria: ClipboardListIcon,
    chat: MessageSquareIcon,
    // Add more mappings as needed
};

const SummaryContent: React.FC<{ summary: any; summarySection: SectionConfig | undefined }> = ({ summary, summarySection }) => {
    const topics = summarySection?.topics || [];
    const entries = topics
        .map(topic => ({
            label: topic.label,
            value: summary?.[topic.key] || ''
        }))
        .filter(entry => entry.value && entry.value.trim() !== '' && entry.value.toLowerCase() !== 'not specified');

    if (entries.length === 0) {
        return <p className="p-6 text-slate-500 dark:text-slate-400">No summary information could be extracted from the document.</p>;
    }

    return (
        <div className="h-full overflow-y-auto p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {entries.map(({ label, value }) => (
                    <div key={label} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-md">
                        <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</dt>
                        <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            <ReactMarkdown>{value}</ReactMarkdown>
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

const TextContent: React.FC<{ title: string, text: string }> = ({ title, text }) => {
    if (!text || text.trim() === '') {
        return <p className="p-6 text-slate-500 dark:text-slate-400">No information about {title.toLowerCase()} could be extracted from the document.</p>;
    }
    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-li:my-1 whitespace-pre-wrap leading-relaxed">
                <ReactMarkdown>{text}</ReactMarkdown>
            </div>
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
    analysisResult,
    messages,
    onQuestionSubmit,
    isAnswering,
    isReady,
    docType
}) => {
    const [docConfig, setDocConfig] = useState<DocumentTypeConfig | null>(null);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch(`/api/document-types`);
                const allTypes: DocumentTypeConfig[] = await res.json();
                const config = allTypes.find(dt => dt.type === docType) || null;
                setDocConfig(config);
            } catch (e) {
                setDocConfig(null);
            }
        }
        if (docType) fetchConfig();
    }, [docType]);

    const sectionTabs = docConfig
        ? docConfig.sections.map(section => ({
            id: section.key,
            label: section.label,
            icon: iconMap[section.key] || ListChecksIcon,
        }))
        : [
            { id: 'summary', label: 'Summary', icon: ListChecksIcon }
        ];

    const tabs = [
        ...sectionTabs,
        { id: 'chat', label: 'Chat', icon: MessageSquareIcon }
    ];

    const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

    useEffect(() => {
        setActiveTab(tabs[0].id);
    }, [docType, tabs.length]);

    const renderContent = () => {
        if (activeTab === 'chat') {
            return <ChatInterface messages={messages} onQuestionSubmit={onQuestionSubmit} isAnswering={isAnswering} isReady={isReady} />;
        }
        if (!docConfig) {
            return <div className="p-6 text-slate-500 dark:text-slate-400">Loading document configuration...</div>;
        }
        const section = docConfig.sections.find(s => s.key === activeTab);
        if (!section) return null;

        if (section.key === 'summary' && analysisResult.summary) {
            return <SummaryContent summary={analysisResult.summary} summarySection={section} />;
        }
        // For other dynamic sections, use section.key
        const text = analysisResult[section.key];
        return <TextContent title={section.label} text={text} />;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-4" role="tablist" aria-label="Document Analysis">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center font-semibold px-4 py-3 border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                            ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                    >
                        <tab.icon />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div id={`tabpanel-${activeTab}`} role="tabpanel" className="flex-grow overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                {renderContent()}
            </div>
        </div>
    );
};