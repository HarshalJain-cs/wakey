// apps/desktop/src/main/csp-headers.ts
// Phase 5: Content Security Policy Headers

import { session } from 'electron';

// ============================================
// CSP Configuration
// ============================================

const isDev = process.env.NODE_ENV === 'development';

// Development CSP - more permissive for hot reload
const CSP_DEV = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' ws://localhost:* wss://localhost:* https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.notion.com https://api.todoist.com https://slack.com https://discord.com https://graph.microsoft.com https://api.github.com https://maker.ifttt.com https://hook.make.com https://hooks.zapier.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
].join('; ');

// Production CSP - strict security
const CSP_PROD = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for React, remove if using CSP nonces
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.notion.com https://api.todoist.com https://slack.com https://discord.com https://graph.microsoft.com https://api.github.com https://maker.ifttt.com https://hook.make.com https://hooks.zapier.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
].join('; ');

// Additional security headers
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
};

// ============================================
// Setup Function
// ============================================

export function setupCSPHeaders(): void {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };

        // Add CSP header
        responseHeaders['Content-Security-Policy'] = [isDev ? CSP_DEV : CSP_PROD];

        // Add security headers
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            responseHeaders[key] = [value];
        });

        callback({ responseHeaders });
    });

    console.log(`[CSP] Content Security Policy configured (${isDev ? 'development' : 'production'} mode)`);
}

// ============================================
// Integration Domain Whitelist
// ============================================

export const ALLOWED_EXTERNAL_DOMAINS = [
    // OAuth providers
    'accounts.google.com',
    'login.microsoftonline.com',
    'oauth.slack.com',
    'discord.com',
    'github.com',
    'api.notion.com',
    'todoist.com',
    'app.asana.com',
    'linear.app',
    'atlassian.net',
    'zapier.com',
    'make.com',
    'ifttt.com',

    // API endpoints
    'api.openai.com',
    'api.anthropic.com',
    'supabase.co',

    // Resource CDNs
    'fonts.googleapis.com',
    'fonts.gstatic.com',
];

/**
 * Check if a URL is from an allowed external domain
 */
export function isAllowedDomain(url: string): boolean {
    try {
        const parsedUrl = new URL(url);

        // Always allow file:// and localhost
        if (parsedUrl.protocol === 'file:') return true;
        if (parsedUrl.hostname === 'localhost') return true;

        // Check against whitelist
        return ALLOWED_EXTERNAL_DOMAINS.some(domain =>
            parsedUrl.hostname === domain ||
            parsedUrl.hostname.endsWith('.' + domain)
        );
    } catch {
        return false;
    }
}

export default {
    setupCSPHeaders,
    isAllowedDomain,
    ALLOWED_EXTERNAL_DOMAINS
};
