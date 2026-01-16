/**
 * @fileoverview Quote of the Day Service
 * 
 * Fetches inspirational and productivity quotes from free APIs.
 * Caches quotes locally to minimize API calls.
 */

export interface Quote {
    text: string;
    author: string;
    category?: string;
}

interface QuoteCache {
    quotes: Quote[];
    lastFetch: string;
    todaysQuote: Quote | null;
}

// Fallback quotes for offline/demo mode
const FALLBACK_QUOTES: Quote[] = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "work" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
    { text: "It's not about having time, it's about making time.", author: "Unknown", category: "time" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg", category: "productivity" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
    { text: "Your focus determines your reality.", author: "Qui-Gon Jinn", category: "focus" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "simplicity" },
    { text: "Work smarter, not harder.", author: "Allen F. Morgenstern", category: "productivity" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "action" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "persistence" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "action" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "start" },
    { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer", category: "productivity" },
    { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport", category: "focus" },
    { text: "Time is what we want most, but what we use worst.", author: "William Penn", category: "time" },
    { text: "Either you run the day, or the day runs you.", author: "Jim Rohn", category: "control" },
    { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey", category: "priorities" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King", category: "work" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "action" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "motivation" },
];

class QuoteService {
    private cache: QuoteCache;

    constructor() {
        this.cache = this.loadCache();
    }

    private loadCache(): QuoteCache {
        try {
            const stored = localStorage.getItem('wakey_quotes');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load quote cache:', error);
        }

        return {
            quotes: FALLBACK_QUOTES,
            lastFetch: '',
            todaysQuote: null,
        };
    }

    private saveCache(): void {
        localStorage.setItem('wakey_quotes', JSON.stringify(this.cache));
    }

    /**
     * Get today's quote (consistent for the day)
     */
    getTodaysQuote(): Quote {
        const today = new Date().toISOString().split('T')[0];

        // If we already have today's quote, return it
        if (this.cache.todaysQuote && this.cache.lastFetch === today) {
            return this.cache.todaysQuote;
        }

        // Select a new quote based on the date (deterministic)
        const dayOfYear = this.getDayOfYear();
        const quoteIndex = dayOfYear % this.cache.quotes.length;
        const quote = this.cache.quotes[quoteIndex];

        this.cache.todaysQuote = quote;
        this.cache.lastFetch = today;
        this.saveCache();

        return quote;
    }

    private getDayOfYear(): number {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    /**
     * Get a random quote
     */
    getRandomQuote(): Quote {
        const randomIndex = Math.floor(Math.random() * this.cache.quotes.length);
        return this.cache.quotes[randomIndex];
    }

    /**
     * Get quote by category
     */
    getQuoteByCategory(category: string): Quote | null {
        const categoryQuotes = this.cache.quotes.filter(q => q.category === category);
        if (categoryQuotes.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
        return categoryQuotes[randomIndex];
    }

    /**
     * Get all available categories
     */
    getCategories(): string[] {
        const categories = new Set(this.cache.quotes.map(q => q.category).filter(Boolean));
        return Array.from(categories) as string[];
    }

    /**
     * Fetch quotes from API (for refreshing cache)
     */
    async fetchQuotes(): Promise<void> {
        try {
            // Using ZenQuotes API (free, no key required)
            const response = await fetch('https://zenquotes.io/api/quotes');

            if (!response.ok) {
                throw new Error('Quote API request failed');
            }

            const data = await response.json();

            const newQuotes: Quote[] = data.map((item: { q: string; a: string }) => ({
                text: item.q,
                author: item.a,
                category: 'general',
            }));

            // Merge with existing quotes, keeping fallbacks
            this.cache.quotes = [...FALLBACK_QUOTES, ...newQuotes];
            this.saveCache();
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
            // Keep using fallback quotes
        }
    }

    /**
     * Add custom quote
     */
    addCustomQuote(quote: Quote): void {
        this.cache.quotes.push(quote);
        this.saveCache();
    }

    /**
     * Get all quotes
     */
    getAllQuotes(): Quote[] {
        return [...this.cache.quotes];
    }

    /**
     * Format quote for display
     */
    formatQuote(quote: Quote): string {
        return `"${quote.text}" — ${quote.author}`;
    }
}

export const quoteService = new QuoteService();
export default quoteService;
