// apps/desktop/src/renderer/services/performance-monitor-service.ts
// Phase 5: Performance Monitoring for Production

/**
 * Performance Monitor Service
 * 
 * Tracks and optimizes application performance:
 * - Memory usage monitoring
 * - Render performance tracking
 * - Long task detection
 * - Bundle size analysis
 * - Performance budgets
 */

interface PerformanceMetric {
    name: string;
    value: number;
    unit: 'ms' | 'mb' | 'count' | 'percent';
    timestamp: number;
    context?: string;
}

interface PerformanceReport {
    generatedAt: number;
    sessionDuration: number;
    metrics: {
        memory: {
            used: number;
            total: number;
            percentage: number;
        };
        timing: {
            pageLoad: number;
            firstPaint: number;
            firstContentfulPaint: number;
            largestContentfulPaint: number;
        };
        interactions: {
            avgResponseTime: number;
            slowInteractions: number;
            totalInteractions: number;
        };
        errors: {
            count: number;
            types: Record<string, number>;
        };
    };
    warnings: string[];
    suggestions: string[];
}

interface LongTask {
    duration: number;
    startTime: number;
    context: string;
}

class PerformanceMonitorService {
    private metrics: PerformanceMetric[] = [];
    private longTasks: LongTask[] = [];
    private sessionStart = Date.now();
    private interactionTimes: number[] = [];
    private errorCounts: Record<string, number> = {};
    private isMonitoring = false;
    private longTaskObserver: PerformanceObserver | null = null;

    // Performance budgets (in ms)
    private readonly BUDGETS = {
        pageLoad: 3000,
        firstPaint: 1000,
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        longTaskThreshold: 50,
        interactionResponse: 100,
    };

    constructor() {
        this.init();
    }

    private init(): void {
        // Only run in browser context
        if (typeof window === 'undefined') return;

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.recordMetric('visibility', document.hidden ? 0 : 1, 'count', 'visibility change');
        });

        // Track errors
        window.addEventListener('error', (event) => {
            const errorType = event.error?.name || 'Error';
            this.errorCounts[errorType] = (this.errorCounts[errorType] || 0) + 1;
        });

        window.addEventListener('unhandledrejection', () => {
            this.errorCounts['UnhandledPromise'] = (this.errorCounts['UnhandledPromise'] || 0) + 1;
        });

        // Start long task observer
        this.observeLongTasks();
    }

    // ============================================
    // Core Monitoring
    // ============================================

    start(): void {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.sessionStart = Date.now();
        this.recordCoreWebVitals();
    }

    stop(): void {
        this.isMonitoring = false;
        this.longTaskObserver?.disconnect();
    }

    private recordCoreWebVitals(): void {
        if (typeof performance === 'undefined') return;

        // Performance Navigation Timing
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
            this.recordMetric('pageLoad', navTiming.loadEventEnd - navTiming.startTime, 'ms', 'Page Load');
            this.recordMetric('domInteractive', navTiming.domInteractive - navTiming.startTime, 'ms', 'DOM Interactive');
            this.recordMetric('timeToFirstByte', navTiming.responseStart - navTiming.requestStart, 'ms', 'TTFB');
        }

        // Paint Timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            this.recordMetric(entry.name, entry.startTime, 'ms', 'Paint Timing');
        });

        // First Input Delay (FID) - requires PerformanceObserver
        this.observeFirstInput();

        // Largest Contentful Paint (LCP)
        this.observeLCP();
    }

    private observeLongTasks(): void {
        if (typeof PerformanceObserver === 'undefined') return;

        try {
            this.longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > this.BUDGETS.longTaskThreshold) {
                        this.longTasks.push({
                            duration: entry.duration,
                            startTime: entry.startTime,
                            context: entry.name || 'unknown'
                        });
                    }
                });
            });

            this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch {
            // Long task observation not supported
        }
    }

    private observeFirstInput(): void {
        if (typeof PerformanceObserver === 'undefined') return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                    const firstInput = entries[0] as PerformanceEventTiming;
                    this.recordMetric('firstInputDelay', firstInput.processingStart - firstInput.startTime, 'ms', 'FID');
                    observer.disconnect();
                }
            });

            observer.observe({ type: 'first-input', buffered: true });
        } catch {
            // First input observation not supported
        }
    }

    private observeLCP(): void {
        if (typeof PerformanceObserver === 'undefined') return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    this.recordMetric('largestContentfulPaint', lastEntry.startTime, 'ms', 'LCP');
                }
            });

            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
            // LCP observation not supported
        }
    }

    // ============================================
    // Metric Recording
    // ============================================

    recordMetric(name: string, value: number, unit: PerformanceMetric['unit'], context?: string): void {
        this.metrics.push({
            name,
            value,
            unit,
            timestamp: Date.now(),
            context
        });

        // Keep only last 1000 metrics
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
    }

    recordInteraction(responseTime: number): void {
        this.interactionTimes.push(responseTime);

        if (responseTime > this.BUDGETS.interactionResponse) {
            this.recordMetric('slowInteraction', responseTime, 'ms', 'User Interaction');
        }

        // Keep only last 500 interactions
        if (this.interactionTimes.length > 500) {
            this.interactionTimes = this.interactionTimes.slice(-500);
        }
    }

    // ============================================
    // Memory Monitoring
    // ============================================

    getMemoryUsage(): { used: number; total: number; percentage: number } | null {
        if (typeof performance === 'undefined' || !(performance as any).memory) {
            return null;
        }

        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        const total = memory.jsHeapSizeLimit / (1024 * 1024);

        return {
            used: Math.round(used * 100) / 100,
            total: Math.round(total * 100) / 100,
            percentage: Math.round((used / total) * 100)
        };
    }

    // ============================================
    // Report Generation
    // ============================================

    generateReport(): PerformanceReport {
        const memory = this.getMemoryUsage() || { used: 0, total: 0, percentage: 0 };
        const avgResponseTime = this.interactionTimes.length > 0
            ? this.interactionTimes.reduce((a, b) => a + b, 0) / this.interactionTimes.length
            : 0;
        const slowInteractions = this.interactionTimes.filter(t => t > this.BUDGETS.interactionResponse).length;

        const report: PerformanceReport = {
            generatedAt: Date.now(),
            sessionDuration: Date.now() - this.sessionStart,
            metrics: {
                memory,
                timing: {
                    pageLoad: this.getMetricValue('pageLoad'),
                    firstPaint: this.getMetricValue('first-paint'),
                    firstContentfulPaint: this.getMetricValue('first-contentful-paint'),
                    largestContentfulPaint: this.getMetricValue('largestContentfulPaint'),
                },
                interactions: {
                    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
                    slowInteractions,
                    totalInteractions: this.interactionTimes.length,
                },
                errors: {
                    count: Object.values(this.errorCounts).reduce((a, b) => a + b, 0),
                    types: { ...this.errorCounts }
                }
            },
            warnings: [],
            suggestions: []
        };

        // Add warnings and suggestions
        this.analyzePerformance(report);

        return report;
    }

    private getMetricValue(name: string): number {
        const metric = this.metrics.find(m => m.name === name);
        return metric?.value || 0;
    }

    private analyzePerformance(report: PerformanceReport): void {
        const { metrics } = report;

        // Page Load Analysis
        if (metrics.timing.pageLoad > this.BUDGETS.pageLoad) {
            report.warnings.push(`Page load time (${Math.round(metrics.timing.pageLoad)}ms) exceeds budget (${this.BUDGETS.pageLoad}ms)`);
            report.suggestions.push('Consider lazy loading non-critical components');
        }

        // LCP Analysis
        if (metrics.timing.largestContentfulPaint > this.BUDGETS.largestContentfulPaint) {
            report.warnings.push(`LCP (${Math.round(metrics.timing.largestContentfulPaint)}ms) exceeds budget (${this.BUDGETS.largestContentfulPaint}ms)`);
            report.suggestions.push('Optimize largest content element loading');
        }

        // Memory Analysis
        if (metrics.memory.percentage > 80) {
            report.warnings.push(`High memory usage (${metrics.memory.percentage}%)`);
            report.suggestions.push('Consider clearing unused data and optimizing state management');
        }

        // Interaction Responsiveness
        if (metrics.interactions.slowInteractions > 5) {
            report.warnings.push(`${metrics.interactions.slowInteractions} slow interactions detected`);
            report.suggestions.push('Optimize event handlers and reduce main thread work');
        }

        // Long Tasks
        if (this.longTasks.length > 0) {
            const totalLongTaskTime = this.longTasks.reduce((a, b) => a + b.duration, 0);
            report.warnings.push(`${this.longTasks.length} long tasks detected (${Math.round(totalLongTaskTime)}ms total)`);
            report.suggestions.push('Break up long-running tasks using requestIdleCallback or Web Workers');
        }

        // Error Analysis
        if (metrics.errors.count > 0) {
            report.warnings.push(`${metrics.errors.count} errors recorded during session`);
        }
    }

    // ============================================
    // Utility Methods
    // ============================================

    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    getLongTasks(): LongTask[] {
        return [...this.longTasks];
    }

    clearMetrics(): void {
        this.metrics = [];
        this.longTasks = [];
        this.interactionTimes = [];
        this.errorCounts = {};
    }

    // Performance measurement wrapper
    async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            this.recordMetric(name, duration, 'ms', 'Custom Measurement');
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(`${name}_error`, duration, 'ms', 'Custom Measurement Error');
            throw error;
        }
    }

    // Sync measurement wrapper
    measureSync<T>(name: string, fn: () => T): T {
        const start = performance.now();
        try {
            const result = fn();
            const duration = performance.now() - start;
            this.recordMetric(name, duration, 'ms', 'Custom Measurement');
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(`${name}_error`, duration, 'ms', 'Custom Measurement Error');
            throw error;
        }
    }
}

export const performanceMonitor = new PerformanceMonitorService();
