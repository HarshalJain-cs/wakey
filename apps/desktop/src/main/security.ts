/**
 * @fileoverview Security Module
 * 
 * Provides secure encryption key generation and WebSocket authentication:
 * - Machine-specific encryption key derivation
 * - Random salt generation and storage
 * - WebSocket token generation and validation
 * 
 * @module main/security
 */

import { scryptSync, randomBytes, createHash } from 'crypto';
import { hostname, userInfo } from 'os';
import Store from 'electron-store';

// Store instance for security data
const securityStore = new Store({
    name: 'wakey-security',
    encryptionKey: 'wakey-security-store-key-v1', // This store itself needs a key
});

// ============================================
// Encryption Key Management
// ============================================

/**
 * Gets or generates a unique salt for this installation.
 * Salt is stored persistently and reused for key derivation.
 */
function getOrCreateSalt(): Buffer {
    const storedSalt = securityStore.get('encryption.salt') as string | undefined;
    
    if (storedSalt) {
        return Buffer.from(storedSalt, 'hex');
    }
    
    // Generate new random salt (32 bytes)
    const newSalt = randomBytes(32);
    securityStore.set('encryption.salt', newSalt.toString('hex'));
    console.log('[Security] Generated new encryption salt for this installation');
    
    return newSalt;
}

/**
 * Gets machine-specific identifier for key derivation.
 * Combines hostname and user info for uniqueness.
 */
function getMachineIdentifier(): string {
    try {
        const user = userInfo();
        const host = hostname();
        // Create a hash of machine info for privacy
        const hash = createHash('sha256')
            .update(`${host}:${user.username}:${user.uid ?? 'default'}`)
            .digest('hex');
        return hash;
    } catch {
        // Fallback if userInfo fails
        return createHash('sha256').update(hostname()).digest('hex');
    }
}

/**
 * Gets the encryption key for API key storage.
 * Key is derived from machine-specific data + stored salt.
 * This ensures keys encrypted on one machine cannot be decrypted on another.
 */
export function getEncryptionKey(): Buffer {
    const salt = getOrCreateSalt();
    const machineId = getMachineIdentifier();
    
    // Derive 32-byte key using scrypt (secure key derivation)
    const key = scryptSync(
        `wakey-secure-${machineId}`,
        salt,
        32,
        { N: 16384, r: 8, p: 1 } // Recommended scrypt parameters
    );
    
    return key;
}

// ============================================
// WebSocket Authentication
// ============================================

/**
 * Generates a new WebSocket authentication token.
 * Token is stored and used to validate browser extension connections.
 */
export function generateWebSocketToken(): string {
    const token = randomBytes(32).toString('hex');
    securityStore.set('websocket.token', token);
    securityStore.set('websocket.tokenCreatedAt', Date.now());
    return token;
}

/**
 * Gets the current WebSocket token, generating one if needed.
 */
export function getWebSocketToken(): string {
    let token = securityStore.get('websocket.token') as string | undefined;
    
    if (!token) {
        token = generateWebSocketToken();
    }
    
    return token;
}

/**
 * Validates a WebSocket token.
 * Returns true if token matches the stored token.
 */
export function validateWebSocketToken(token: string | null | undefined): boolean {
    if (!token) {
        return false;
    }
    
    const storedToken = securityStore.get('websocket.token') as string | undefined;
    
    if (!storedToken) {
        return false;
    }
    
    // Constant-time comparison to prevent timing attacks
    if (token.length !== storedToken.length) {
        return false;
    }
    
    let result = 0;
    for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
    }
    
    return result === 0;
}

/**
 * Regenerates the WebSocket token.
 * Call this if token may have been compromised.
 */
export function rotateWebSocketToken(): string {
    return generateWebSocketToken();
}

// ============================================
// Utility Functions
// ============================================

/**
 * Clears all security data (for testing/reset).
 * WARNING: This will invalidate all encrypted data!
 */
export function clearSecurityData(): void {
    securityStore.clear();
    console.log('[Security] All security data cleared');
}

/**
 * Gets security module status for debugging.
 */
export function getSecurityStatus(): {
    hasSalt: boolean;
    hasWsToken: boolean;
    wsTokenAge: number | null;
} {
    const salt = securityStore.get('encryption.salt');
    const wsToken = securityStore.get('websocket.token');
    const tokenCreatedAt = securityStore.get('websocket.tokenCreatedAt') as number | undefined;
    
    return {
        hasSalt: !!salt,
        hasWsToken: !!wsToken,
        wsTokenAge: tokenCreatedAt ? Date.now() - tokenCreatedAt : null,
    };
}

export default {
    getEncryptionKey,
    generateWebSocketToken,
    getWebSocketToken,
    validateWebSocketToken,
    rotateWebSocketToken,
    clearSecurityData,
    getSecurityStatus,
};
