/**
 * Chart color constants for consistent theming across all visualizations
 */
export const CHART_COLORS = {
    primary: '#14b8a6',      // Teal
    secondary: '#a855f7',    // Purple
    productive: '#22c55e',   // Green
    distracting: '#ef4444',  // Red
    neutral: '#6b7280',      // Gray
    accent: '#3b82f6',       // Blue
    warning: '#f59e0b',      // Amber

    categories: {
        Development: '#3b82f6',
        Communication: '#f59e0b',
        Productivity: '#22c55e',
        Entertainment: '#ef4444',
        'Social Media': '#f97316',
        Design: '#8b5cf6',
        Browser: '#06b6d4',
        Other: '#6b7280',
    } as Record<string, string>,

    // Gradient colors for animated effects
    gradients: {
        teal: ['#14b8a6', '#0d9488'],
        purple: ['#a855f7', '#9333ea'],
        blue: ['#3b82f6', '#2563eb'],
        green: ['#22c55e', '#16a34a'],
        red: ['#ef4444', '#dc2626'],
    },

    // Dark theme background colors
    backgrounds: {
        card: '#1e293b',
        hover: '#334155',
        active: '#475569',
    },
};

// Color palette for multiple data series
export const SERIES_COLORS = [
    '#14b8a6', // Teal
    '#a855f7', // Purple
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f97316', // Orange
    '#84cc16', // Lime
];

// Get color for category with fallback
export function getCategoryColor(category: string): string {
    return CHART_COLORS.categories[category] || CHART_COLORS.neutral;
}
