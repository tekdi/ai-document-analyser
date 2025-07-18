import React, { useState, useEffect } from 'react';
import type { AnalysisResult, Message } from '../types';
import { ChatInterface } from './ChatInterface';
import { ListChecksIcon, ClipboardListIcon, AlertTriangleIcon, MessageSquareIcon, SearchIcon } from './icons';
import ReactMarkdown from 'react-markdown';

interface AnalysisDisplayProps {
    analysisResult: AnalysisResult;
    messages: Message[];
    onQuestionSubmit: (question: string) => void;
    isAnswering: boolean;
    isReady: boolean;
    docType: string;
    documentText: string; // <-- add this
    modelId: string;      // <-- add this
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
    research: SearchIcon,
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

// Research Tab Component
const ResearchTab: React.FC<{ documentText: string; modelId: string }> = ({ documentText, modelId }) => {
    const [questions, setQuestions] = useState<string[]>(['']);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuestionChange = (idx: number, value: string) => {
        setQuestions(qs => {
            const updated = [...qs];
            updated[idx] = value;
            return updated;
        });
    };

    const handleAddQuestion = () => {
        setQuestions(qs => [...qs, '']);
    };

    const handleRemoveQuestion = (idx: number) => {
        setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAnswers({});
        try {
            const filteredQuestions = questions.map(q => q.trim()).filter(q => q.length > 0);
            if (filteredQuestions.length === 0) {
                setError('Please enter at least one research question.');
                setLoading(false);
                return;
            }
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentText,
                    modelId,
                    questions: filteredQuestions,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to get research answers.');
            }
            const data = await res.json();
            setAnswers(data.answers || {});
        } catch (err: any) {
            setError(err.message || 'Failed to get research answers.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Research Questions (one per field):
                    </label>
                    {questions.map((q, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                className="flex-1 p-2 rounded border border-slate-300 dark:bg-slate-700 dark:text-white"
                                value={q}
                                onChange={e => handleQuestionChange(idx, e.target.value)}
                                placeholder={`Enter research question #${idx + 1}`}
                                disabled={loading}
                            />
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(idx)}
                                    className="text-red-500 hover:text-red-700 px-2"
                                    title="Remove question"
                                    disabled={loading}
                                >✕</button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="mt-2 text-blue-600 hover:underline text-sm"
                        disabled={loading}
                    >
                        + Add another question
                    </button>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
                    disabled={loading}
                >
                    {loading ? 'Researching...' : 'Ask'}
                </button>
            </form>
            {error && <div className="mt-4 text-red-500">{error}</div>}
            {Object.keys(answers).length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Research Answers:</h3>
                    <ul className="space-y-4">
                        {Object.entries(answers).map(([question, answer]) => (
                            <li key={question} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 shadow">
                                <div className="font-medium mb-1 text-blue-700 dark:text-blue-300">{question}</div>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{answer}</ReactMarkdown>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
    analysisResult,
    messages,
    onQuestionSubmit,
    isAnswering,
    isReady,
    docType,
    documentText, // <-- add this
    modelId,      // <-- add this
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

    // Build tabs in the requested order
    const summaryTab = { id: 'summary', label: 'Summary', icon: iconMap.summary || ListChecksIcon };
    const researchTab = { id: 'research', label: 'Research', icon: iconMap.research || SearchIcon };
    const chatTab = { id: 'chat', label: 'Chat', icon: iconMap.chat || MessageSquareIcon };

    // Dynamically generated tabs (excluding summary)
    const dynamicTabs = docConfig
        ? docConfig.sections
            .filter(section => section.key !== 'summary')
            .map(section => ({
                id: section.key,
                label: section.label,
                icon: iconMap[section.key] || ListChecksIcon,
            }))
        : [];

    // Tabs: summary, research, chat, ...dynamicTabs
    const tabs = [
        summaryTab,
        researchTab,
        chatTab,
        ...dynamicTabs,
    ];

    const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

    useEffect(() => {
        setActiveTab(tabs[0].id);
    }, [docType, tabs.length]);

    const renderContent = () => {
        if (activeTab === 'chat') {
            return <ChatInterface messages={messages} onQuestionSubmit={onQuestionSubmit} isAnswering={isAnswering} isReady={isReady} />;
        }
        if (activeTab === 'research') {
            // You may want to pass actual modelId and documentText from parent or context
            return (
                <ResearchTab
                    documentText={documentText}
                    modelId={modelId}
                />
            );
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
            {/* Tabs Bar */}
            <div
                className="flex-shrink-0 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 border-b border-slate-200 dark:border-slate-700 px-4 bg-white dark:bg-slate-800"
                role="tablist"
                aria-label="Document Analysis"
                style={{ WebkitOverflowScrolling: 'touch', minHeight: 56, height: 56 }}
            >
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
                        style={{ whiteSpace: 'nowrap', minHeight: 40 }}
                    >
                        <tab.icon />
                        <span className="ml-2">{tab.label}</span>
                    </button>
                ))}
            </div>
            {/* Tab Panel */}
            <div
                id={`tabpanel-${activeTab}`}
                role="tabpanel"
                className="flex-grow overflow-y-auto bg-slate-50 dark:bg-slate-800/50"
                style={{ minHeight: 0, height: 'calc(100vh - 56px)' }}
            >
                {renderContent()}
            </div>
        </div>
    );
};