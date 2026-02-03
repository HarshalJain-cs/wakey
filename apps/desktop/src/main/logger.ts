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

function safeWrite(stream: NodeJS.WriteStream, message: string): void {
    try {
        if (stream && stream.writable) {
            stream.write(message + '\n');
        }
    } catch {
        // Silently ignore all write errors (including EPIPE)
    }
}

function formatMessage(level: LogLevel, args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const rest = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    return `${prefix} ${rest}`;
}

/**
 * Logger with environment-aware log levels.
 * All writes are wrapped to prevent EPIPE crashes.
 */
export const logger = {
    debug: (...args: unknown[]): void => {
        if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) {
            safeWrite(process.stdout, formatMessage('debug', args));
        }
    },

    info: (...args: unknown[]): void => {
        if (LOG_LEVELS.info >= LOG_LEVELS[currentLevel]) {
            safeWrite(process.stdout, formatMessage('info', args));
        }
    },

    warn: (...args: unknown[]): void => {
        if (LOG_LEVELS.warn >= LOG_LEVELS[currentLevel]) {
            safeWrite(process.stderr, formatMessage('warn', args));
        }
    },

    error: (...args: unknown[]): void => {
        safeWrite(process.stderr, formatMessage('error', args));
    },

    getLevel: (): LogLevel => currentLevel,
    isDev: (): boolean => is.dev,
};

export default logger;
