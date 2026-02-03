import { useState } from 'react';
import { X, Download, FileJson, FileSpreadsheet, FileText, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { dataExportService, ExportFormat, ExportResult } from '../services/data-export-service';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ExportType = 'focus' | 'sessions' | 'weekly';

const FORMAT_OPTIONS: { id: ExportFormat; name: string; icon: React.ReactNode; description: string }[] = [
    { id: 'json', name: 'JSON', icon: <FileJson className="w-5 h-5" />, description: 'Machine-readable format' },
    { id: 'csv', name: 'CSV', icon: <FileSpreadsheet className="w-5 h-5" />, description: 'Spreadsheet compatible' },
];

const EXPORT_TYPES: { id: ExportType; name: string; description: string }[] = [
    { id: 'focus', name: 'Focus Data', description: 'Daily focus time, sessions, and scores' },
    { id: 'sessions', name: 'Session History', description: 'Detailed pomodoro session logs' },
    { id: 'weekly', name: 'Weekly Report', description: 'Markdown report with insights' },
];

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
    const [exportType, setExportType] = useState<ExportType>('focus');
    const [format, setFormat] = useState<ExportFormat>('csv');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [exporting, setExporting] = useState(false);
    const [result, setResult] = useState<ExportResult | null>(null);

    if (!isOpen) return null;

    const handleExport = async () => {
        setExporting(true);
        setResult(null);

        try {
            let exportResult: ExportResult;

            if (exportType === 'weekly') {
                exportResult = await dataExportService.exportWeeklyReport();
            } else if (exportType === 'sessions') {
                exportResult = await dataExportService.exportSessionHistory({
                    format,
                    dateRange: {
                        start: new Date(dateRange.start),
                        end: new Date(dateRange.end)
                    }
                });
            } else {
                exportResult = await dataExportService.exportFocusData({
                    format,
                    dateRange: {
                        start: new Date(dateRange.start),
                        end: new Date(dateRange.end)
                    }
                });
            }

            setResult(exportResult);
        } catch (error) {
            setResult({
                success: false,
                filename: '',
                size: 0,
                error: error instanceof Error ? error.message : 'Export failed'
            });
        } finally {
            setExporting(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-dark-800 border border-dark-700 rounded-xl w-full max-w-lg mx-4 shadow-2xl animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <Download className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Export Data</h2>
                            <p className="text-xs text-dark-400">Download your productivity data</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Export Type Selection */}
                    <div>
                        <label className="text-sm text-dark-400 mb-2 block">Export Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {EXPORT_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setExportType(type.id)}
                                    className={`p-3 rounded-lg border text-left transition-all ${exportType === type.id
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-dark-600 bg-dark-900/50 hover:border-dark-500'
                                        }`}
                                >
                                    <div className={`text-sm font-medium ${exportType === type.id ? 'text-primary-400' : 'text-white'
                                        }`}>
                                        {type.name}
                                    </div>
                                    <div className="text-xs text-dark-500 mt-0.5 line-clamp-1">
                                        {type.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Format Selection (not for weekly report) */}
                    {exportType !== 'weekly' && (
                        <div>
                            <label className="text-sm text-dark-400 mb-2 block">Format</label>
                            <div className="flex gap-2">
                                {FORMAT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setFormat(opt.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${format === opt.id
                                                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                                : 'border-dark-600 bg-dark-900/50 text-dark-300 hover:border-dark-500'
                                            }`}
                                    >
                                        {opt.icon}
                                        <span className="text-sm font-medium">{opt.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date Range */}
                    <div>
                        <label className="text-sm text-dark-400 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date Range
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="input-field flex-1 text-sm"
                            />
                            <span className="self-center text-dark-500">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="input-field flex-1 text-sm"
                            />
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`p-3 rounded-lg flex items-start gap-3 ${result.success
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-red-500/10 border border-red-500/30'
                            }`}>
                            {result.success ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                    <div>
                                        <div className="text-sm text-green-400 font-medium">Export Successful!</div>
                                        <div className="text-xs text-dark-400 mt-0.5">
                                            {result.filename} ({formatBytes(result.size)})
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <div>
                                        <div className="text-sm text-red-400 font-medium">Export Failed</div>
                                        <div className="text-xs text-dark-400 mt-0.5">{result.error}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-4 border-t border-dark-700">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="btn-primary flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
