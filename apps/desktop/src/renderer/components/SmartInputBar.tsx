import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Sparkles, Calendar, Clock, Tag,
    AlertCircle, User, Check, Loader2
} from 'lucide-react';

interface ParsedTask {
    title: string;
    dueDate?: Date;
    dueTime?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    assignee?: string;
    recurring?: string;
}

interface SmartInputBarProps {
    onSubmit: (task: ParsedTask) => void;
    placeholder?: string;
}

// Simple NLP patterns
const DATE_PATTERNS = [
    { pattern: /\btomorrow\b/i, getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { pattern: /\btoday\b/i, getDate: () => new Date() },
    { pattern: /\bnext week\b/i, getDate: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
    { pattern: /\bnext monday\b/i, getDate: () => getNextDayOfWeek(1) },
    { pattern: /\bnext friday\b/i, getDate: () => getNextDayOfWeek(5) },
    { pattern: /\bon (\d{1,2})(?:st|nd|rd|th)?\b/i, getDate: (m: RegExpMatchArray) => { const d = new Date(); d.setDate(parseInt(m[1])); return d; } },
];

const TIME_PATTERNS = [
    {
        pattern: /\bat (\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i, extract: (m: RegExpMatchArray) => {
            let hour = parseInt(m[1]);
            const min = m[2] ? parseInt(m[2]) : 0;
            const ampm = m[3]?.toLowerCase();
            if (ampm === 'pm' && hour < 12) hour += 12;
            if (ampm === 'am' && hour === 12) hour = 0;
            return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        }
    },
];

const PRIORITY_PATTERNS = [
    { pattern: /\b(urgent|asap|critical)\b/i, priority: 'urgent' as const },
    { pattern: /\bhigh priority\b/i, priority: 'high' as const },
    { pattern: /\blow priority\b/i, priority: 'low' as const },
    { pattern: /!{3,}/i, priority: 'urgent' as const },
    { pattern: /!{2}/i, priority: 'high' as const },
];

const RECURRING_PATTERNS = [
    { pattern: /\bevery day\b/i, type: 'daily' },
    { pattern: /\bevery week\b/i, type: 'weekly' },
    { pattern: /\bevery monday\b/i, type: 'weekly:1' },
    { pattern: /\bevery month\b/i, type: 'monthly' },
];

function getNextDayOfWeek(dayOfWeek: number): Date {
    const today = new Date();
    const daysUntil = (dayOfWeek - today.getDay() + 7) % 7 || 7;
    const result = new Date(today);
    result.setDate(today.getDate() + daysUntil);
    return result;
}

export default function SmartInputBar({ onSubmit, placeholder = "Add task... (try: 'Review docs tomorrow at 2pm !!')" }: SmartInputBarProps) {
    const [input, setInput] = useState('');
    const [parsed, setParsed] = useState<ParsedTask | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse input in real-time
    useEffect(() => {
        if (!input.trim()) {
            setParsed(null);
            setShowPreview(false);
            return;
        }

        const result: ParsedTask = { title: input };
        let cleanTitle = input;

        // Extract date
        for (const { pattern, getDate } of DATE_PATTERNS) {
            const match = input.match(pattern);
            if (match) {
                result.dueDate = getDate(match);
                cleanTitle = cleanTitle.replace(match[0], '').trim();
                break;
            }
        }

        // Extract time
        for (const { pattern, extract } of TIME_PATTERNS) {
            const match = input.match(pattern);
            if (match) {
                result.dueTime = extract(match);
                cleanTitle = cleanTitle.replace(match[0], '').trim();
                break;
            }
        }

        // Extract priority
        for (const { pattern, priority } of PRIORITY_PATTERNS) {
            const match = input.match(pattern);
            if (match) {
                result.priority = priority;
                cleanTitle = cleanTitle.replace(match[0], '').trim();
                break;
            }
        }

        // Extract recurring
        for (const { pattern, type } of RECURRING_PATTERNS) {
            const match = input.match(pattern);
            if (match) {
                result.recurring = type;
                cleanTitle = cleanTitle.replace(match[0], '').trim();
                break;
            }
        }

        // Extract tags (hashtags)
        const tagMatches = input.matchAll(/#(\w+)/g);
        const tags: string[] = [];
        for (const m of tagMatches) {
            tags.push(m[1]);
            cleanTitle = cleanTitle.replace(m[0], '').trim();
        }
        if (tags.length > 0) result.tags = tags;

        // Extract assignee (@mentions)
        const assigneeMatch = input.match(/@(\w+)/);
        if (assigneeMatch) {
            result.assignee = assigneeMatch[1];
            cleanTitle = cleanTitle.replace(assigneeMatch[0], '').trim();
        }

        // Clean title
        result.title = cleanTitle.replace(/\s+/g, ' ').trim();

        setParsed(result);
        setShowPreview(Object.keys(result).length > 1 || result.title !== input.trim());
    }, [input]);

    const handleSubmit = useCallback(async () => {
        if (!parsed?.title.trim()) return;

        setIsProcessing(true);
        await onSubmit(parsed);

        setInput('');
        setParsed(null);
        setShowPreview(false);
        setIsProcessing(false);
    }, [parsed, onSubmit]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const formatDate = (date?: Date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 bg-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20';
            case 'low': return 'text-green-400 bg-green-500/20';
            default: return 'text-dark-400 bg-dark-700';
        }
    };

    return (
        <div className="relative">
            {/* Input Bar */}
            <div className="relative flex items-center gap-2 bg-dark-800 rounded-xl border border-dark-700 p-2 focus-within:border-primary-500 transition-colors">
                <Sparkles className="w-5 h-5 text-primary-400 ml-2" />
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-white placeholder-dark-500 focus:outline-none text-sm"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!parsed?.title.trim() || isProcessing}
                    className={`p-2 rounded-lg transition-all ${parsed?.title.trim() && !isProcessing
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                        }`}
                >
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Smart Preview */}
            {showPreview && parsed && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-dark-800 rounded-xl border border-dark-700 shadow-xl z-10">
                    <div className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-400 mt-1" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{parsed.title}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {parsed.dueDate && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(parsed.dueDate)}
                                    </span>
                                )}
                                {parsed.dueTime && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                        <Clock className="w-3 h-3" />
                                        {parsed.dueTime}
                                    </span>
                                )}
                                {parsed.priority && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getPriorityColor(parsed.priority)}`}>
                                        <AlertCircle className="w-3 h-3" />
                                        {parsed.priority}
                                    </span>
                                )}
                                {parsed.tags?.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-dark-700 text-dark-300 rounded text-xs">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                                {parsed.assignee && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                        <User className="w-3 h-3" />
                                        {parsed.assignee}
                                    </span>
                                )}
                                {parsed.recurring && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                        🔁 {parsed.recurring}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
