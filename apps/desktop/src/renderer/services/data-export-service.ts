import { enhancedPomodoroService } from './enhanced-pomodoro-service';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
    format: ExportFormat;
    dateRange: {
        start: Date;
        end: Date;
    };
    includeFields?: string[];
    filename?: string;
}

export interface DailyStats {
    date: string;
    focusMinutes: number;
    sessions: number;
    distractions: number;
    productivityScore: number;
    topApps: string[];
    tasksCompleted: number;
}

export interface ExportResult {
    success: boolean;
    filename: string;
    size: number;
    error?: string;
}

class DataExportService {
    async exportFocusData(options: ExportOptions): Promise<ExportResult> {
        try {
            const data = await this.gatherFocusData(options.dateRange);
            const blob = await this.formatData(data, options.format);
            const filename = options.filename || this.generateFilename('focus-data', options.format);

            await this.downloadBlob(blob, filename);

            return {
                success: true,
                filename,
                size: blob.size
            };
        } catch (error) {
            return {
                success: false,
                filename: '',
                size: 0,
                error: error instanceof Error ? error.message : 'Export failed'
            };
        }
    }

    async exportSessionHistory(options: ExportOptions): Promise<ExportResult> {
        try {
            const blob = await enhancedPomodoroService.exportSessions(options.format, options.dateRange);
            const filename = options.filename || this.generateFilename('sessions', options.format);

            await this.downloadBlob(blob, filename);

            return {
                success: true,
                filename,
                size: blob.size
            };
        } catch (error) {
            return {
                success: false,
                filename: '',
                size: 0,
                error: error instanceof Error ? error.message : 'Export failed'
            };
        }
    }

    async exportWeeklyReport(): Promise<ExportResult> {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            const data = await this.gatherFocusData({ start: startDate, end: endDate });
            const report = this.generateWeeklyReport(data);

            const blob = new Blob([report], { type: 'text/markdown' });
            const filename = this.generateFilename('weekly-report', 'md' as ExportFormat);

            await this.downloadBlob(blob, filename);

            return {
                success: true,
                filename,
                size: blob.size
            };
        } catch (error) {
            return {
                success: false,
                filename: '',
                size: 0,
                error: error instanceof Error ? error.message : 'Export failed'
            };
        }
    }

    private async gatherFocusData(dateRange: { start: Date; end: Date }): Promise<DailyStats[]> {
        // In production: fetch from database
        // For now: generate mock data for the date range
        const days: DailyStats[] = [];
        const current = new Date(dateRange.start);

        while (current <= dateRange.end) {
            days.push({
                date: current.toISOString().split('T')[0],
                focusMinutes: Math.floor(Math.random() * 180) + 60,
                sessions: Math.floor(Math.random() * 6) + 1,
                distractions: Math.floor(Math.random() * 10),
                productivityScore: Math.floor(Math.random() * 40) + 50,
                topApps: ['VS Code', 'Chrome', 'Terminal'].slice(0, Math.floor(Math.random() * 3) + 1),
                tasksCompleted: Math.floor(Math.random() * 8)
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    private async formatData(data: DailyStats[], format: ExportFormat): Promise<Blob> {
        if (format === 'json') {
            return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        }

        if (format === 'csv') {
            const headers = ['Date', 'Focus Minutes', 'Sessions', 'Distractions', 'Productivity Score', 'Top Apps', 'Tasks Completed'];
            const rows = data.map(d => [
                d.date,
                d.focusMinutes.toString(),
                d.sessions.toString(),
                d.distractions.toString(),
                d.productivityScore.toString(),
                d.topApps.join('; '),
                d.tasksCompleted.toString()
            ].join(','));

            const csv = [headers.join(','), ...rows].join('\n');
            return new Blob([csv], { type: 'text/csv' });
        }

        // PDF would require a library like jspdf
        throw new Error('PDF export not yet implemented');
    }

    private generateWeeklyReport(data: DailyStats[]): string {
        const totalFocus = data.reduce((sum, d) => sum + d.focusMinutes, 0);
        const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
        const totalDistractions = data.reduce((sum, d) => sum + d.distractions, 0);
        const avgScore = Math.round(data.reduce((sum, d) => sum + d.productivityScore, 0) / data.length);
        const totalTasks = data.reduce((sum, d) => sum + d.tasksCompleted, 0);

        const formatHours = (minutes: number) => {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h}h ${m}m`;
        };

        const bestDay = data.reduce((best, d) => d.focusMinutes > best.focusMinutes ? d : best);

        return `# Weekly Productivity Report

**Period:** ${data[0]?.date} to ${data[data.length - 1]?.date}
**Generated:** ${new Date().toLocaleDateString()}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Focus Time | ${formatHours(totalFocus)} |
| Focus Sessions | ${totalSessions} |
| Tasks Completed | ${totalTasks} |
| Distractions | ${totalDistractions} |
| Average Score | ${avgScore}/100 |

---

## Best Day

**${bestDay.date}** - ${formatHours(bestDay.focusMinutes)} of focused work

---

## Daily Breakdown

| Date | Focus Time | Sessions | Score |
|------|------------|----------|-------|
${data.map(d => `| ${d.date} | ${formatHours(d.focusMinutes)} | ${d.sessions} | ${d.productivityScore} |`).join('\n')}

---

## Insights

${avgScore >= 70 ? '✅ Great week! Your productivity is above average.' : '⚠️ There\'s room for improvement. Try reducing distractions.'}

${totalDistractions < data.length * 3 ? '🎯 Excellent focus! You kept distractions low.' : '💡 Consider using focus mode to reduce interruptions.'}

---

*Generated by Wakey - Your Productivity Companion*
`;
    }

    private generateFilename(prefix: string, format: ExportFormat | 'md'): string {
        const date = new Date().toISOString().split('T')[0];
        return `wakey-${prefix}-${date}.${format}`;
    }

    private async downloadBlob(blob: Blob, filename: string): Promise<void> {
        // In Electron, use the file dialog
        if (window.wakey?.saveFile) {
            const arrayBuffer = await blob.arrayBuffer();
            await window.wakey.saveFile(filename, new Uint8Array(arrayBuffer));
            return;
        }

        // Fallback for web: create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const dataExportService = new DataExportService();
export type { DailyStats as ExportDailyStats };
