// apps/desktop/src/renderer/lib/sanitize.ts

import DOMPurify from 'dompurify';

// Use browser's window for DOMPurify in renderer process
const purify = DOMPurify(window);

export function sanitizeHtml(dirty: string): string {
    return purify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
    });
}

export function sanitizeText(input: string): string {
    return input
        .replace(/[<>]/g, '')  // Remove angle brackets
        .replace(/javascript:/gi, '')  // Remove javascript: URIs
        .trim();
}

export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[/\\?%*:|"<>]/g, '-')  // Replace illegal characters
        .replace(/\.\./g, '')  // Remove path traversal
        .substring(0, 255);  // Limit length
}

export function sanitizeUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }
        return parsed.toString();
    } catch {
        return null;
    }
}
