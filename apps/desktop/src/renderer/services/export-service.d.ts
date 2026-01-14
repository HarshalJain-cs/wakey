export interface ExportOptions {
    filename: string;
    format: 'csv' | 'json' | 'pdf';
    dateRange?: {
        start: Date;
        end: Date;
    };
}
/**
 * Export data to CSV format
 */
export declare function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string, columns?: {
    key: keyof T;
    header: string;
}[]): void;
/**
 * Export data to JSON format
 */
export declare function exportToJSON<T>(data: T, filename: string, pretty?: boolean): void;
/**
 * Export HTML element to PDF
 * Uses html2canvas approach (simplified version)
 */
export declare function exportToPDF(elementId: string, filename: string, title?: string): Promise<void>;
export interface ActivityExportData {
    [key: string]: string | number | boolean;
    app_name: string;
    window_title: string;
    category: string;
    duration_minutes: number;
    is_distraction: boolean;
    date: string;
}
/**
 * Export activities with formatting
 */
export declare function exportActivities(activities: ActivityExportData[], format: 'csv' | 'json', filename?: string): void;
export interface FocusSessionExportData {
    [key: string]: string | number;
    type: string;
    duration_minutes: number;
    quality_score: number;
    distractions_count: number;
    started_at: string;
    ended_at: string;
}
/**
 * Export focus sessions with formatting
 */
export declare function exportFocusSessions(sessions: FocusSessionExportData[], format: 'csv' | 'json', filename?: string): void;
export interface FullBackupData {
    version: string;
    exportedAt: string;
    activities: unknown[];
    focusSessions: unknown[];
    tasks: unknown[];
    notes: unknown[];
    flashcards: unknown[];
    settings: Record<string, unknown>;
}
/**
 * Export full backup of all data
 */
export declare function exportFullBackup(data: FullBackupData): void;
/**
 * Format date for filenames
 */
export declare function formatDateForFilename(date?: Date): string;
/**
 * Generate report title with date range
 */
export declare function generateReportTitle(reportType: string, startDate?: Date, endDate?: Date): string;
//# sourceMappingURL=export-service.d.ts.map