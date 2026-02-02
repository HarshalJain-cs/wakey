// apps/desktop/src/main/secure-storage.ts

import keytar from 'keytar';
import crypto from 'crypto';
import { safeStorage } from 'electron';

const SERVICE_NAME = 'Wakey';

export class SecureStorage {
    private encryptionKey: Buffer | null = null;

    async initialize(): Promise<void> {
        // Get or create master key from OS keychain
        let masterKey = await keytar.getPassword(SERVICE_NAME, 'master-key');

        if (!masterKey) {
            masterKey = crypto.randomBytes(32).toString('hex');
            await keytar.setPassword(SERVICE_NAME, 'master-key', masterKey);
        }

        this.encryptionKey = Buffer.from(masterKey, 'hex');
    }

    async setCredential(key: string, value: string): Promise<void> {
        await keytar.setPassword(SERVICE_NAME, key, value);
    }

    async getCredential(key: string): Promise<string | null> {
        return keytar.getPassword(SERVICE_NAME, key);
    }

    async deleteCredential(key: string): Promise<void> {
        await keytar.deletePassword(SERVICE_NAME, key);
    }

    // For general encrypted storage
    encrypt(data: string): string {
        if (!this.encryptionKey) throw new Error('Storage not initialized');

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return JSON.stringify({
            iv: iv.toString('hex'),
            data: encrypted,
            tag: authTag.toString('hex')
        });
    }

    decrypt(encryptedData: string): string {
        if (!this.encryptionKey) throw new Error('Storage not initialized');

        const { iv, data, tag } = JSON.parse(encryptedData);

        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            this.encryptionKey,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(tag, 'hex'));

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    // Electron's safeStorage for sensitive data
    encryptWithSafeStorage(data: string): Buffer {
        return safeStorage.encryptString(data);
    }

    decryptWithSafeStorage(encrypted: Buffer): string {
        return safeStorage.decryptString(encrypted);
    }

    isEncryptionAvailable(): boolean {
        return safeStorage.isEncryptionAvailable();
    }
}

export const secureStorage = new SecureStorage();
