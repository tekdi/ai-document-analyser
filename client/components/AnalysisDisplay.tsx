import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult, Message } from '../types';
import { ChatInterface } from './ChatInterface';
import { ListChecksIcon, ClipboardListIcon, AlertTriangleIcon, MessageSquareIcon, SearchIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import { SmartRenderer } from './SmartRenderer';

interface AnalysisDisplayProps {
    analysisResult: AnalysisResult;
    messages: Message[];
    onQuestionSubmit: (question: string) => void;
    isAnswering: boolean;
    isReady: boolean;
    docType: string;
    documentText: string;
    modelId: string;
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

// Helper function to process special formatting markers
const processSpecialFormatting = (text: string): string => {
    if (typeof text !== 'string') return text;
    
    // Convert (FLASH_RED) and similar markers to HTML with red styling
    return text
        .replace(/\(FLASH_RED\)/gi, '<span style="color: #ef4444; font-weight: bold; animation: blink 1s infinite;">⚠️</span>')
        .replace(/\(RED_FLASHING\)/gi, '<span style="color: #ef4444; font-weight: bold; animation: blink 1s infinite;">⚠️</span>')
        .replace(/flash it in red color/gi, '<span style="color: #ef4444; font-weight: bold;">⚠️ ATTENTION</span>')
        .replace(/show it in Red Flashing color/gi, '<span style="color: #ef4444; font-weight: bold; animation: blink 1s infinite;">⚠️ ATTENTION</span>');
};

const SummaryContent: React.FC<{ summary: any; summarySection: SectionConfig | undefined }> = ({ summary, summarySection }) => {
    const topics = summarySection?.topics || [];

    // Check if we have individual topic keys or a combined fallback
    const hasIndividualTopics = topics.some(topic => summary?.[topic.key]);

    if (!hasIndividualTopics && summary?.combined) {
        // Fallback: display the combined summary as single content block
        return (
            <div className="h-full overflow-y-auto p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-li:my-1 whitespace-pre-wrap leading-relaxed">
                    <ReactMarkdown>{summary.combined}</ReactMarkdown>
                </div>
            </div>
        );
    }

    // Standard individual topic display with SmartRenderer
    const entries = topics
        .map(topic => {
            const rawValue = summary?.[topic.key];
            let value = null;
            let pages = null;
            let hasSpecialFormatting = false;

            if (typeof rawValue === 'string') {
                // Simple string value
                const processed = processSpecialFormatting(rawValue);
                hasSpecialFormatting = processed.includes('<span');
                value = processed;
            } else if (rawValue && typeof rawValue === 'object' && rawValue.value !== undefined) {
                // Structured format with value and page_numbers
                value = rawValue.value;
                pages = rawValue.page_numbers;

                // Apply special formatting to string values or string arrays
                if (typeof value === 'string') {
                    const processed = processSpecialFormatting(value);
                    hasSpecialFormatting = processed.includes('<span');
                    value = processed;
                } else if (Array.isArray(value)) {
                    value = value.map(item => {
                        if (typeof item === 'string') {
                            return processSpecialFormatting(item);
                        }
                        return item;
                    });
                }
            }

            return {
                label: topic.label,
                value: value,
                pages: pages,
                hasSpecialFormatting: hasSpecialFormatting,
                topicKey: topic.key
            };
        })
        .filter(entry => {
            if (!entry.value) return false;
            if (typeof entry.value === 'string') {
                const trimmed = entry.value.trim();
                return trimmed !== '' && trimmed.toLowerCase() !== 'not specified';
            }
            return true;
        });

    if (entries.length === 0) {
        return <p className="p-6 text-slate-500 dark:text-slate-400">No summary information could be extracted from the document.</p>;
    }

    return (
        <div className="h-full overflow-y-auto p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {entries.map(({ label, value, pages, hasSpecialFormatting, topicKey }) => (
                    <div key={label} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-md">
                        <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{label}</dt>
                        <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                            {hasSpecialFormatting ? (
                                // Render HTML content with special formatting
                                <div dangerouslySetInnerHTML={{ __html: value }} />
                            ) : (
                                // Use SmartRenderer for all other content
                                <SmartRenderer value={value} pages={pages} topicKey={topicKey} />
                            )}
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
        <div className="p-6 max-w-2xl mx-auto h-full overflow-y-auto">
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
    documentText,
    modelId,
}) => {
    const [docConfig, setDocConfig] = useState<DocumentTypeConfig | null>(null);

    // Progressive section state
    const [sectionData, setSectionData] = useState<Record<string, any>>({});
    const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
    const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
    const [errorSections, setErrorSections] = useState<Record<string, string>>({});

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

    // Track which sections have been requested for loading
    const requestedSectionsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        setActiveTab(tabs[0].id);
    }, [docType, tabs.length]);

    // Fetch document config
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

    // Helper to fetch up to 2 sections at a time
    const fetchSections = async (sectionKeys: string[]) => {
        if (!docConfig) return;
        setLoadingSections(prev => new Set([...prev, ...sectionKeys]));
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentText,
                    documentType: docType,
                    modelId,
                    sections: sectionKeys,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to analyze section(s).');
            }
            const data = await res.json();
            setSectionData(prev => ({ ...prev, ...data }));
            setLoadedSections(prev => {
                const next = new Set(prev);
                sectionKeys.forEach(k => next.add(k));
                return next;
            });
        } catch (err: any) {
            setErrorSections(prev => {
                const next = { ...prev };
                sectionKeys.forEach(k => { next[k] = err.message || 'Failed to load section.'; });
                return next;
            });
        } finally {
            setLoadingSections(prev => {
                const next = new Set(prev);
                sectionKeys.forEach(k => next.delete(k));
                return next;
            });
        }
    };

    // On mount or docConfig change, request summary and first dynamic tab
    useEffect(() => {
        if (!docConfig) return;
        const initialKeys = ['summary'];
        if (dynamicTabs.length > 0) initialKeys.push(dynamicTabs[0].id);
        // Only fetch if not already requested
        const toFetch = initialKeys.filter(k => !requestedSectionsRef.current.has(k));
        if (toFetch.length > 0) {
            toFetch.forEach(k => requestedSectionsRef.current.add(k));
            fetchSections(toFetch);
        }
    }, [docConfig, documentText, docType, modelId]);

    // Prefetch all other sections in the background, 2 at a time, after initial load
    useEffect(() => {
        if (!docConfig) return;
        // Exclude summary and research/chat tabs
        const allSectionKeys = docConfig.sections.map(s => s.key).filter(k => k !== 'summary');
        // Only fetch those not already requested
        const toFetch = allSectionKeys.filter(k => !requestedSectionsRef.current.has(k));
        if (toFetch.length === 0) return;

        let cancelled = false;
        const fetchInBatches = async () => {
            for (let i = 0; i < toFetch.length; i += 2) {
                if (cancelled) break;
                const batch = toFetch.slice(i, i + 2);
                batch.forEach(k => requestedSectionsRef.current.add(k));
                await fetchSections(batch);
            }
        };
        fetchInBatches();
        return () => { cancelled = true; };
        // eslint-disable-next-line
    }, [docConfig, documentText, docType, modelId]);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    const renderContent = () => {
        if (activeTab === 'chat') {
            return <ChatInterface messages={messages} onQuestionSubmit={onQuestionSubmit} isAnswering={isAnswering} isReady={isReady} />;
        }
        if (activeTab === 'research') {
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

        if (loadingSections.has(activeTab)) {
            return <div className="p-6 text-slate-500 dark:text-slate-400">Loading...</div>;
        }
        if (errorSections[activeTab]) {
            return <div className="p-6 text-red-500">{errorSections[activeTab]}</div>;
        }
        if (activeTab === 'summary') {
            return <SummaryContent summary={sectionData.summary} summarySection={section} />;
        }
        // For other dynamic sections, use section.key
        const text = sectionData[activeTab];
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
                        onClick={() => handleTabClick(tab.id)}
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