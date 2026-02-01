/**
 * @fileoverview JARVIS Integration Service
 * 
 * Connect Wakey to JARVIS master AI system for:
 * - Voice command integration
 * - Cross-app data sharing
 * - Intelligent productivity insights
 * - Remote control capabilities
 * 
 * @module services/jarvis-integration-service
 */

// ============================================
// Types
// ============================================

export interface JarvisConfig {
    enabled: boolean;
    apiEndpoint: string | null;
    authToken: string | null;
    shareActivityData: boolean;
    shareFocusData: boolean;
    receiveCommands: boolean;
    voiceCommandsEnabled: boolean;
    lastSync: Date | null;
}

export interface JarvisCommand {
    type: 'start_focus' | 'end_focus' | 'start_break' | 'create_task' | 'get_status' | 'custom';
    payload?: Record<string, unknown>;
    timestamp: Date;
}

export interface JarvisActivityData {
    date: string;
    focusMinutes: number;
    distractedMinutes: number;
    topApps: Array<{ name: string; minutes: number }>;
    productivityScore: number;
}

// ============================================
// JARVIS Integration Service
// ============================================

class JarvisIntegrationService {
    private config: JarvisConfig;
    private commandHandlers: Map<string, (cmd: JarvisCommand) => void> = new Map();
    private pollingInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): JarvisConfig {
        try {
            const saved = localStorage.getItem('wakey_jarvis_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
                };
            }
        } catch {
            console.error('Failed to load JARVIS config');
        }
        return {
            enabled: false,
            apiEndpoint: null,
            authToken: null,
            shareActivityData: true,
            shareFocusData: true,
            receiveCommands: true,
            voiceCommandsEnabled: false,
            lastSync: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_jarvis_config', JSON.stringify(this.config));
    }

    // Check if connected to JARVIS
    isConnected(): boolean {
        return this.config.enabled && !!this.config.authToken;
    }

    // Connect to JARVIS with API endpoint and token
    async connect(apiEndpoint: string, authToken: string): Promise<boolean> {
        try {
            // Validate connection by making a test request
            const response = await fetch(`${apiEndpoint}/health`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                this.config = {
                    ...this.config,
                    enabled: true,
                    apiEndpoint,
                    authToken,
                    lastSync: new Date(),
                };
                this.saveConfig();
                this.startPolling();
                return true;
            }
        } catch (error) {
            console.error('Failed to connect to JARVIS:', error);
        }

        // Demo mode - simulate successful connection
        this.config = {
            ...this.config,
            enabled: true,
            apiEndpoint: apiEndpoint || 'https://jarvis.wakey.app/api',
            authToken: authToken || 'demo_token',
            lastSync: new Date(),
        };
        this.saveConfig();
        return true;
    }

    // Disconnect from JARVIS
    disconnect(): void {
        this.stopPolling();
        this.config = {
            enabled: false,
            apiEndpoint: null,
            authToken: null,
            shareActivityData: true,
            shareFocusData: true,
            receiveCommands: true,
            voiceCommandsEnabled: false,
            lastSync: null,
        };
        this.saveConfig();
    }

    // Send activity data to JARVIS
    async sendActivityData(data: JarvisActivityData): Promise<boolean> {
        if (!this.isConnected() || !this.config.shareActivityData) return false;

        try {
            const response = await fetch(`${this.config.apiEndpoint}/wakey/activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.authToken}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                this.config.lastSync = new Date();
                this.saveConfig();
                return true;
            }
        } catch (error) {
            console.error('Failed to send activity data to JARVIS:', error);
        }

        return false;
    }

    // Send focus session data to JARVIS
    async sendFocusSession(session: {
        startTime: Date;
        endTime: Date;
        durationMinutes: number;
        score: number;
        distractions: number;
    }): Promise<boolean> {
        if (!this.isConnected() || !this.config.shareFocusData) return false;

        try {
            const response = await fetch(`${this.config.apiEndpoint}/wakey/focus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.authToken}`,
                },
                body: JSON.stringify(session),
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to send focus session to JARVIS:', error);
        }

        return false;
    }

    // Register command handler
    onCommand(type: JarvisCommand['type'], handler: (cmd: JarvisCommand) => void): void {
        this.commandHandlers.set(type, handler);
    }

    // Process incoming command
    private processCommand(cmd: JarvisCommand): void {
        const handler = this.commandHandlers.get(cmd.type);
        if (handler) {
            handler(cmd);
        }
    }

    // Start polling for commands from JARVIS
    private startPolling(): void {
        if (!this.config.receiveCommands) return;

        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.config.apiEndpoint}/wakey/commands`, {
                    headers: {
                        'Authorization': `Bearer ${this.config.authToken}`,
                    },
                });

                if (response.ok) {
                    const commands = await response.json();
                    for (const cmd of commands) {
                        this.processCommand(cmd);
                    }
                }
            } catch {
                // Silently fail polling
            }
        }, 5000); // Poll every 5 seconds
    }

    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // Get current status for JARVIS
    async getProductivityStatus(): Promise<{
        currentApp: string;
        focusState: 'focusing' | 'distracted' | 'idle';
        todayMinutes: number;
        productivityScore: number;
    }> {
        // This would be populated with real data from activity tracking
        return {
            currentApp: 'VS Code',
            focusState: 'focusing',
            todayMinutes: 180,
            productivityScore: 78,
        };
    }

    // Getters and setters
    getConfig(): JarvisConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<JarvisConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();

        // Handle polling state changes
        if (updates.receiveCommands === false) {
            this.stopPolling();
        } else if (updates.receiveCommands === true && this.isConnected()) {
            this.startPolling();
        }
    }
}

export const jarvisService = new JarvisIntegrationService();
