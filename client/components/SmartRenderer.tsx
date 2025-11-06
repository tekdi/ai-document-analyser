import React from 'react';
import ReactMarkdown from 'react-markdown';

// Type definitions for different data structures
interface DateEvent {
    event: string;
    date: string;
    page_numbers?: number[];
}

interface ProfileData {
    name: string;
    summary?: string;
    [key: string]: any;
}

// Helper functions to detect data structures
const hasEventDateStructure = (items: any[]): boolean => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.every(item =>
        typeof item === 'object' &&
        item !== null &&
        'event' in item &&
        'date' in item
    );
};

const isSimpleStringArray = (items: any[]): boolean => {
    if (!Array.isArray(items) || items.length === 0) return false;
    return items.every(item => typeof item === 'string');
};

const isProfileObject = (data: any): boolean => {
    return (
        typeof data === 'object' &&
        data !== null &&
        'name' in data &&
        !Array.isArray(data)
    );
};

// Timeline Renderer for event/date structures
const TimelineRenderer: React.FC<{ items: DateEvent[]; pages?: number[] }> = ({ items, pages }) => {
    return (
        <div className="space-y-3">
            <div className="relative border-l-2 border-blue-500 dark:border-blue-400 pl-4 space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[1.3rem] top-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full border-2 border-white dark:border-slate-800"></div>

                        {/* Content */}
                        <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
                            <div className="font-medium text-slate-700 dark:text-slate-200 text-sm mb-1">
                                {item.event}
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                📅 {item.date}
                            </div>
                            {item.page_numbers && item.page_numbers.length > 0 && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Page {item.page_numbers.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {pages && pages.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                    Found on pages: {pages.join(', ')}
                </div>
            )}
        </div>
    );
};

// Checklist Renderer for simple string arrays
const ChecklistRenderer: React.FC<{ items: string[]; pages?: number[] }> = ({ items, pages }) => {
    return (
        <div className="space-y-2">
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        {/* Checkbox icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            <svg
                                className="w-5 h-5 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>

                        {/* Item text */}
                        <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                {item}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
            {pages && pages.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                    Found on pages: {pages.join(', ')}
                </div>
            )}
        </div>
    );
};

// Profile Card Renderer for objects with name/summary
const ProfileCardRenderer: React.FC<{ data: ProfileData; pages?: number[] }> = ({ data, pages }) => {
    // Extract main fields
    const { name, summary, ...otherFields } = data;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 shadow-sm border border-blue-100 dark:border-slate-600">
            {/* Organization name with icon */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-shrink-0 text-2xl">
                    🏛️
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">
                    {name}
                </div>
            </div>

            {/* Summary section */}
            {summary && (
                <div className="mb-3">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                        Summary
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">
                        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                            {summary}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Additional fields */}
            {Object.keys(otherFields).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(otherFields).map(([key, value]) => (
                        <div key={key} className="text-sm">
                            <span className="font-medium text-slate-600 dark:text-slate-300 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>{' '}
                            <span className="text-slate-700 dark:text-slate-200">
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Page references */}
            {pages && pages.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-slate-500">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Page {pages.join(', ')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Table Renderer for event/date structures (alternative to timeline)
const TableRenderer: React.FC<{ items: DateEvent[]; pages?: number[] }> = ({ items, pages }) => {
    return (
        <div className="space-y-2">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
                                Event
                            </th>
                            <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {items.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-4 py-2 text-slate-700 dark:text-slate-200">
                                    {item.event}
                                    {item.page_numbers && item.page_numbers.length > 0 && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                                            (Page {item.page_numbers.join(', ')})
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium">
                                    {item.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pages && pages.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                    Found on pages: {pages.join(', ')}
                </div>
            )}
        </div>
    );
};

// Main Smart Renderer Component
interface SmartRendererProps {
    value: any;
    pages?: number[];
    topicKey?: string;
}

export const SmartRenderer: React.FC<SmartRendererProps> = ({ value, pages, topicKey }) => {
    // Handle arrays
    if (Array.isArray(value)) {
        // Check for event/date structure (timeline/table view)
        if (hasEventDateStructure(value)) {
            // Use timeline for general cases, can be switched to table if preferred
            return <TimelineRenderer items={value} pages={pages} />;
        }

        // Check for simple string array (checklist view)
        if (isSimpleStringArray(value)) {
            return <ChecklistRenderer items={value} pages={pages} />;
        }

        // Fallback for other array types - markdown list
        const markdownList = value.map(item =>
            `- ${typeof item === 'string' ? item : JSON.stringify(item)}`
        ).join('\n');
        return (
            <div>
                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                    {markdownList}
                </ReactMarkdown>
                {pages && pages.length > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                        Found on pages: {pages.join(', ')}
                    </div>
                )}
            </div>
        );
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
        // Check for profile structure
        if (isProfileObject(value)) {
            return <ProfileCardRenderer data={value} pages={pages} />;
        }

        // Fallback for other object types
        return (
            <div>
                <pre className="text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                </pre>
                {pages && pages.length > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                        Found on pages: {pages.join(', ')}
                    </div>
                )}
            </div>
        );
    }

    // Handle strings (markdown rendering)
    if (typeof value === 'string') {
        return (
            <div>
                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                    {value}
                </ReactMarkdown>
                {pages && pages.length > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                        Found on pages: {pages.join(', ')}
                    </div>
                )}
            </div>
        );
    }

    // Fallback for any other type
    return <div className="text-slate-500 dark:text-slate-400">Unable to render value</div>;
};
