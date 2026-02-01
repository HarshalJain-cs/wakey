/**
 * @fileoverview Voice Command Validator
 * 
 * Validates and sanitizes voice commands to prevent injection attacks.
 * Uses an allowlist of safe command patterns.
 * 
 * @module main/voice-validator
 */

/**
 * Allowed voice command patterns.
 * Commands must match one of these patterns to be executed.
 */
const ALLOWED_COMMAND_PATTERNS: RegExp[] = [
    // Focus commands
    /^start\s+focus(?:\s+for\s+)?(\d{1,3})?(?:\s+minutes?)?$/i,
    /^stop\s+focus$/i,
    /^pause\s+focus$/i,
    /^resume\s+focus$/i,

    // Break commands
    /^start\s+break(?:\s+for\s+)?(\d{1,3})?(?:\s+minutes?)?$/i,
    /^take\s+a?\s*break(?:\s+for\s+)?(\d{1,3})?(?:\s+minutes?)?$/i,
    /^stop\s+break$/i,

    // Task commands
    /^create\s+task\s+(.{1,200})$/i,
    /^add\s+task\s+(.{1,200})$/i,
    /^complete\s+task\s+(.{1,100})$/i,
    /^finish\s+task\s+(.{1,100})$/i,
    /^delete\s+task\s+(.{1,100})$/i,
    /^remove\s+task\s+(.{1,100})$/i,

    // Query commands
    /^get\s+(stats|status|tasks|focus|activity)$/i,
    /^show\s+(stats|status|tasks|focus|activity)$/i,
    /^what('s|\s+is)\s+(my\s+)?(stats|status|progress|focus\s+time)$/i,
    /^how\s+(am\s+i\s+doing|much\s+time|long\s+have\s+i).*$/i,

    // Tracking commands
    /^start\s+tracking$/i,
    /^stop\s+tracking$/i,
    /^toggle\s+tracking$/i,

    // Navigation commands
    /^open\s+(dashboard|settings|analytics|tasks|focus)$/i,
    /^go\s+to\s+(dashboard|settings|analytics|tasks|focus)$/i,
    /^show\s+(dashboard|settings|analytics|tasks|focus)$/i,
];

/**
 * Maximum allowed command length.
 */
const MAX_COMMAND_LENGTH = 500;

/**
 * Characters that are never allowed in commands.
 */
const DANGEROUS_CHARS = /[<>{}[\]\\`$]/g;

/**
 * Sanitizes a voice command by removing potentially dangerous characters.
 */
export function sanitizeCommand(command: string): string {
    if (!command || typeof command !== 'string') {
        return '';
    }

    // Trim and limit length
    let sanitized = command.trim().slice(0, MAX_COMMAND_LENGTH);

    // Remove dangerous characters
    sanitized = sanitized.replace(DANGEROUS_CHARS, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
}

/**
 * Validates a voice command against the allowlist.
 * Returns true if the command matches an allowed pattern.
 */
export function isValidVoiceCommand(command: string): boolean {
    const sanitized = sanitizeCommand(command);

    if (!sanitized) {
        return false;
    }

    return ALLOWED_COMMAND_PATTERNS.some(pattern => pattern.test(sanitized));
}

/**
 * Parses a voice command and extracts command type and parameters.
 * Returns null if command is invalid.
 */
export function parseVoiceCommand(command: string): {
    type: string;
    action: string;
    params: Record<string, string | number>;
} | null {
    const sanitized = sanitizeCommand(command);

    if (!isValidVoiceCommand(sanitized)) {
        return null;
    }

    const lower = sanitized.toLowerCase();

    // Focus commands
    if (/^start\s+focus/.test(lower)) {
        const durationMatch = lower.match(/(\d+)/);
        return {
            type: 'focus',
            action: 'start',
            params: { duration: durationMatch ? parseInt(durationMatch[1], 10) : 25 },
        };
    }

    if (/^stop\s+focus/.test(lower)) {
        return { type: 'focus', action: 'stop', params: {} };
    }

    // Break commands
    if (/^(start|take)\s+(a\s+)?break/.test(lower)) {
        const durationMatch = lower.match(/(\d+)/);
        return {
            type: 'break',
            action: 'start',
            params: { duration: durationMatch ? parseInt(durationMatch[1], 10) : 5 },
        };
    }

    // Task commands
    const createTaskMatch = lower.match(/^(create|add)\s+task\s+(.+)$/i);
    if (createTaskMatch) {
        return {
            type: 'task',
            action: 'create',
            params: { title: sanitized.slice(createTaskMatch[1].length + 6).trim() },
        };
    }

    const completeTaskMatch = lower.match(/^(complete|finish)\s+task\s+(.+)$/i);
    if (completeTaskMatch) {
        return {
            type: 'task',
            action: 'complete',
            params: { title: sanitized.slice(completeTaskMatch[1].length + 6).trim() },
        };
    }

    // Query commands
    if (/^(get|show)\s+(stats|status)/.test(lower)) {
        return { type: 'query', action: 'stats', params: {} };
    }

    if (/^(get|show)\s+tasks/.test(lower)) {
        return { type: 'query', action: 'tasks', params: {} };
    }

    // Tracking commands
    if (/tracking$/.test(lower)) {
        if (/^start/.test(lower)) {
            return { type: 'tracking', action: 'start', params: {} };
        }
        if (/^stop/.test(lower)) {
            return { type: 'tracking', action: 'stop', params: {} };
        }
        if (/^toggle/.test(lower)) {
            return { type: 'tracking', action: 'toggle', params: {} };
        }
    }

    // Navigation commands
    const navMatch = lower.match(/^(open|go\s+to|show)\s+(dashboard|settings|analytics|tasks|focus)$/);
    if (navMatch) {
        return {
            type: 'navigation',
            action: 'open',
            params: { page: navMatch[2] },
        };
    }

    // Fallback - command passed validation but wasn't parsed
    return null;
}

export default {
    sanitizeCommand,
    isValidVoiceCommand,
    parseVoiceCommand,
    ALLOWED_COMMAND_PATTERNS,
};
