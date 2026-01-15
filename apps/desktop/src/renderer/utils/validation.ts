/**
 * @fileoverview Input Validation and Sanitization Utilities
 * 
 * Provides type guards, validators, and sanitizers for runtime safety.
 * 
 * @module utils/validation
 */

// ============================================
// Type Guards
// ============================================

/**
 * Type guard to check if a value is a non-null object.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a positive number.
 */
export function isPositiveNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Type guard to check if a value is a valid integer within range.
 */
export function isIntegerInRange(value: unknown, min: number, max: number): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/**
 * Type guard for valid email format.
 */
export function isValidEmail(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

/**
 * Type guard for valid URL format.
 */
export function isValidUrl(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

// ============================================
// Validators
// ============================================

/**
 * Validation result with error messages.
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates task input data.
 */
export function validateTaskInput(data: unknown): ValidationResult {
    const errors: string[] = [];

    if (!isObject(data)) {
        return { isValid: false, errors: ['Invalid input: expected object'] };
    }

    if (!isNonEmptyString(data.title)) {
        errors.push('Title is required and must be non-empty');
    }

    if (data.priority && !['high', 'medium', 'low'].includes(data.priority as string)) {
        errors.push('Priority must be high, medium, or low');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates focus session parameters.
 */
export function validateFocusSession(duration: unknown, type: unknown): ValidationResult {
    const errors: string[] = [];

    if (!isIntegerInRange(duration, 1, 240)) {
        errors.push('Duration must be between 1 and 240 minutes');
    }

    if (type !== 'focus' && type !== 'break') {
        errors.push('Type must be focus or break');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validates API key format.
 */
export function validateApiKey(key: unknown, prefix?: string): ValidationResult {
    const errors: string[] = [];

    if (!isNonEmptyString(key)) {
        errors.push('API key is required');
    } else if (key.length < 10) {
        errors.push('API key appears to be too short');
    } else if (prefix && !key.startsWith(prefix)) {
        errors.push(`API key should start with ${prefix}`);
    }

    return { isValid: errors.length === 0, errors };
}

// ============================================
// Sanitizers
// ============================================

/**
 * Sanitizes string input by trimming and removing dangerous characters.
 */
export function sanitizeString(input: string, maxLength = 1000): string {
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, ''); // Basic XSS prevention
}

/**
 * Sanitizes task title.
 */
export function sanitizeTaskTitle(title: string): string {
    return sanitizeString(title, 200);
}

/**
 * Sanitizes note content.
 */
export function sanitizeNoteContent(content: string): string {
    return sanitizeString(content, 50000);
}

/**
 * Sanitizes tag input.
 */
export function sanitizeTags(tags: string[]): string[] {
    return tags
        .map(tag => sanitizeString(tag, 50).toLowerCase())
        .filter(tag => tag.length > 0)
        .slice(0, 20); // Max 20 tags
}

// ============================================
// Assertions
// ============================================

/**
 * Asserts a condition, throwing an error if false.
 */
export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Asserts value is defined (not null/undefined).
 */
export function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error(`${name} is required but was ${value}`);
    }
}
