/**
 * @fileoverview Production-aware Logger
 * 
 * Provides logging with environment-based filtering:
 * - Debug and info logs are suppressed in production
 * - Warn and error logs are always shown
 * 
 * @module main/logger
 */

import { is } from '@electron-toolkit/utils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// In production, only show warnings and errors
// In development, show all logs
const currentLevel: LogLevel = is.dev ? 'debug' : 'warn';

/**
 * Formats a log message with timestamp and level.
 */
function formatMessage(level: LogLevel, args: unknown[]): string[] {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return [prefix, ...args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    )];
}

/**
 * Logger with environment-aware log levels.
 * 
 * Usage:
 *   logger.debug('Detailed debug info');  // Only in dev
 *   logger.info('General info');           // Only in dev
 *   logger.warn('Warning message');        // Always
 *   logger.error('Error occurred', err);   // Always
 */
export const logger = {
    /**
     * Debug level - development only.
     * Use for detailed debugging information.
     */
    debug: (...args: unknown[]): void => {
        if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) {
            console.log(...formatMessage('debug', args));
        }
    },

    /**
     * Info level - development only.
     * Use for general operational information.
     */
    info: (...args: unknown[]): void => {
        if (LOG_LEVELS.info >= LOG_LEVELS[currentLevel]) {
            console.log(...formatMessage('info', args));
        }
    },

    /**
     * Warn level - always shown.
     * Use for potential issues that don't stop execution.
     */
    warn: (...args: unknown[]): void => {
        if (LOG_LEVELS.warn >= LOG_LEVELS[currentLevel]) {
            console.warn(...formatMessage('warn', args));
        }
    },

    /**
     * Error level - always shown.
     * Use for errors and exceptions.
     */
    error: (...args: unknown[]): void => {
        // Errors are always logged
        console.error(...formatMessage('error', args));
    },

    /**
     * Gets the current log level.
     */
    getLevel: (): LogLevel => currentLevel,

    /**
     * Checks if running in development mode.
     */
    isDev: (): boolean => is.dev,
};

export default logger;
