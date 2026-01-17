/**
 * @fileoverview JARVIS Bridge Service
 * 
 * Communication bridge for the JARVIS master project:
 * - Event publishing (activity, focus, tasks)
 * - Command subscription
 * - Real-time sync via Supabase
 * 
 * This service enables Wakey to act as a module within the larger JARVIS ecosystem.
 * 
 * @module services/jarvis-bridge-service
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// Types
// ============================================

export interface JarvisEvent {
    id: string;
    source: 'wakey';
    eventType: JarvisEventType;
    payload: unknown;
    timestamp: Date;
    acknowledged: boolean;
}

export type JarvisEventType =
    | 'activity.changed'
    | 'focus.started'
    | 'focus.ended'
    | 'focus.paused'
    | 'break.started'
    | 'break.ended'
    | 'task.created'
    | 'task.completed'
    | 'task.updated'
    | 'distraction.detected'
    | 'achievement.unlocked'
    | 'productivity.alert'
    | 'deep_work.achieved'
    | 'insight.generated';

export interface JarvisCommand {
    id: string;
    target: 'wakey';
    command: JarvisCommandType;
    params: Record<string, unknown>;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    createdAt: Date;
    executedAt: Date | null;
    result: unknown | null;
    error: string | null;
}

export type JarvisCommandType =
    | 'start_focus'
    | 'stop_focus'
    | 'start_break'
    | 'create_task'
    | 'complete_task'
    | 'get_stats'
    | 'get_insights'
    | 'toggle_tracking'
    | 'set_status'
    | 'execute_voice_command';

export interface JarvisConfig {
    enabled: boolean;
    supabaseUrl: string | null;
    supabaseKey: string | null;
    shareActivityData: boolean;
    shareFocusData: boolean;
    shareTaskData: boolean;
    receiveCommands: boolean;
    autoStartWithJarvis: boolean;
    voiceDictationEnabled: boolean;
}

export interface JarvisConnectionStatus {
    connected: boolean;
    lastHeartbeat: Date | null;
    eventsPublished: number;
    commandsExecuted: number;
    errors: string[];
}

// ============================================
// JARVIS Bridge Service
// ============================================

class JarvisBridgeService {
    private config: JarvisConfig;
    private supabase: SupabaseClient | null = null;
    private eventChannel: RealtimeChannel | null = null;
    private commandChannel: RealtimeChannel | null = null;
    private status: JarvisConnectionStatus;
    private eventQueue: JarvisEvent[] = [];
    private commandHandlers: Map<JarvisCommandType, (params: Record<string, unknown>) => Promise<unknown>> = new Map();

    constructor() {
        this.config = this.loadConfig();
        this.status = this.getInitialStatus();
        this.registerDefaultHandlers();

        if (this.config.enabled) {
            this.connect();
        }
    }

    private loadConfig(): JarvisConfig {
        try {
            const stored = localStorage.getItem('wakey_jarvis_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load JARVIS config:', error);
        }

        return {
            enabled: false,
            supabaseUrl: null,
            supabaseKey: null,
            shareActivityData: true,
            shareFocusData: true,
            shareTaskData: true,
            receiveCommands: true,
            autoStartWithJarvis: true,
            voiceDictationEnabled: true,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_jarvis_config', JSON.stringify(this.config));
    }

    private getInitialStatus(): JarvisConnectionStatus {
        return {
            connected: false,
            lastHeartbeat: null,
            eventsPublished: 0,
            commandsExecuted: 0,
            errors: [],
        };
    }

    // ============================================
    // Connection Management
    // ============================================

    /**
     * Connect to JARVIS via Supabase
     */
    async connect(): Promise<boolean> {
        if (!this.config.supabaseUrl || !this.config.supabaseKey) {
            // Use demo mode for development
            console.log('[JARVIS] Running in demo mode - no Supabase configured');
            this.status.connected = true;
            return true;
        }

        try {
            this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);

            // Subscribe to events channel
            this.eventChannel = this.supabase
                .channel('jarvis-events')
                .on('broadcast', { event: 'wakey-event' }, () => {
                    // Handle event acknowledgments
                })
                .subscribe();

            // Subscribe to commands channel
            if (this.config.receiveCommands) {
                this.commandChannel = this.supabase
                    .channel('jarvis-commands')
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'jarvis_commands',
                        filter: 'target=eq.wakey',
                    }, (payload) => {
                        this.handleIncomingCommand(payload.new as JarvisCommand);
                    })
                    .subscribe();
            }

            this.status.connected = true;
            this.status.lastHeartbeat = new Date();

            // Start heartbeat
            this.startHeartbeat();

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Connection failed';
            this.status.errors.push(message);
            console.error('[JARVIS] Connection error:', error);
            return false;
        }
    }

    /**
     * Disconnect from JARVIS
     */
    async disconnect(): Promise<void> {
        if (this.eventChannel) {
            await this.eventChannel.unsubscribe();
            this.eventChannel = null;
        }
        if (this.commandChannel) {
            await this.commandChannel.unsubscribe();
            this.commandChannel = null;
        }
        this.supabase = null;
        this.status.connected = false;
    }

    /**
     * Check connection status
     */
    isConnected(): boolean {
        return this.status.connected;
    }

    private startHeartbeat(): void {
        setInterval(() => {
            if (this.status.connected) {
                this.status.lastHeartbeat = new Date();
                this.publishEvent('activity.changed', { heartbeat: true });
            }
        }, 60000); // Every minute
    }

    // ============================================
    // Event Publishing
    // ============================================

    /**
     * Publish an event to JARVIS
     */
    async publishEvent(eventType: JarvisEventType, payload: unknown): Promise<boolean> {
        if (!this.config.enabled) return false;

        // Check permissions
        if (!this.shouldPublishEvent(eventType)) {
            return false;
        }

        const event: JarvisEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            source: 'wakey',
            eventType,
            payload,
            timestamp: new Date(),
            acknowledged: false,
        };

        // Queue event
        this.eventQueue.push(event);

        // Send if connected
        if (this.supabase && this.status.connected) {
            try {
                await this.supabase.from('jarvis_events').insert({
                    id: event.id,
                    source: event.source,
                    event_type: event.eventType,
                    payload: event.payload,
                    created_at: event.timestamp.toISOString(),
                });

                event.acknowledged = true;
                this.status.eventsPublished++;

                console.log(`[JARVIS] Published event: ${eventType}`);
                return true;
            } catch (error) {
                console.error('[JARVIS] Failed to publish event:', error);
                return false;
            }
        } else {
            // Demo mode - just log
            console.log(`[JARVIS Demo] Event: ${eventType}`, payload);
            this.status.eventsPublished++;
            return true;
        }
    }

    private shouldPublishEvent(eventType: JarvisEventType): boolean {
        if (eventType.startsWith('activity.') && !this.config.shareActivityData) {
            return false;
        }
        if ((eventType.startsWith('focus.') || eventType.startsWith('break.')) && !this.config.shareFocusData) {
            return false;
        }
        if (eventType.startsWith('task.') && !this.config.shareTaskData) {
            return false;
        }
        return true;
    }

    // ============================================
    // Event Convenience Methods
    // ============================================

    async onFocusStarted(durationMinutes: number): Promise<void> {
        await this.publishEvent('focus.started', { durationMinutes });
    }

    async onFocusEnded(durationMinutes: number, qualityScore: number): Promise<void> {
        await this.publishEvent('focus.ended', { durationMinutes, qualityScore });
    }

    async onBreakStarted(durationMinutes: number): Promise<void> {
        await this.publishEvent('break.started', { durationMinutes });
    }

    async onTaskCreated(taskId: string, title: string): Promise<void> {
        await this.publishEvent('task.created', { taskId, title });
    }

    async onTaskCompleted(taskId: string, title: string): Promise<void> {
        await this.publishEvent('task.completed', { taskId, title });
    }

    async onDistractionDetected(appName: string): Promise<void> {
        await this.publishEvent('distraction.detected', { appName });
    }

    async onAchievementUnlocked(achievementId: string, name: string): Promise<void> {
        await this.publishEvent('achievement.unlocked', { achievementId, name });
    }

    async onDeepWorkAchieved(durationMinutes: number): Promise<void> {
        await this.publishEvent('deep_work.achieved', { durationMinutes });
    }

    async onInsightGenerated(insight: string): Promise<void> {
        await this.publishEvent('insight.generated', { insight });
    }

    // ============================================
    // Command Handling
    // ============================================

    private async handleIncomingCommand(command: JarvisCommand): Promise<void> {
        console.log(`[JARVIS] Received command: ${command.command}`);

        if (!this.config.receiveCommands) {
            console.log('[JARVIS] Command execution disabled');
            return;
        }

        const handler = this.commandHandlers.get(command.command);

        if (!handler) {
            console.warn(`[JARVIS] No handler for command: ${command.command}`);
            await this.updateCommandStatus(command.id, 'failed', null, 'No handler registered');
            return;
        }

        await this.updateCommandStatus(command.id, 'executing', null, null);

        try {
            const result = await handler(command.params);
            await this.updateCommandStatus(command.id, 'completed', result, null);
            this.status.commandsExecuted++;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Execution failed';
            await this.updateCommandStatus(command.id, 'failed', null, message);
        }
    }

    private async updateCommandStatus(
        commandId: string,
        status: JarvisCommand['status'],
        result: unknown | null,
        error: string | null
    ): Promise<void> {
        if (!this.supabase) return;

        try {
            await this.supabase
                .from('jarvis_commands')
                .update({
                    status,
                    result,
                    error,
                    executed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
                })
                .eq('id', commandId);
        } catch (err) {
            console.error('[JARVIS] Failed to update command status:', err);
        }
    }

    /**
     * Register a command handler
     */
    registerHandler(
        command: JarvisCommandType,
        handler: (params: Record<string, unknown>) => Promise<unknown>
    ): void {
        this.commandHandlers.set(command, handler);
    }

    private registerDefaultHandlers(): void {
        // Default handlers - can be overridden by the app
        this.registerHandler('get_stats', async () => {
            // Would return actual stats from the app
            return {
                focusMinutes: 120,
                tasksCompleted: 5,
                productivityScore: 85,
            };
        });

        this.registerHandler('get_insights', async () => {
            return {
                insights: ['You are most productive between 9-11 AM'],
            };
        });
    }

    // ============================================
    // Voice Dictation Support (for JARVIS)
    // ============================================

    /**
     * Process voice command from JARVIS
     */
    async processVoiceCommand(command: string): Promise<string> {
        if (!this.config.voiceDictationEnabled) {
            return 'Voice dictation is disabled';
        }

        const lowerCommand = command.toLowerCase();

        // Start focus
        if (lowerCommand.includes('start focus') || lowerCommand.includes('focus mode')) {
            const match = command.match(/(\d+)\s*minutes?/i);
            const duration = match ? parseInt(match[1]) : 25;

            // Would trigger actual focus session
            await this.publishEvent('focus.started', { durationMinutes: duration, source: 'voice' });
            return `Starting ${duration}-minute focus session`;
        }

        // Stop focus
        if (lowerCommand.includes('stop focus') || lowerCommand.includes('end focus')) {
            await this.publishEvent('focus.ended', { source: 'voice' });
            return 'Focus session ended';
        }

        // Take break
        if (lowerCommand.includes('take a break') || lowerCommand.includes('start break')) {
            const match = command.match(/(\d+)\s*minutes?/i);
            const duration = match ? parseInt(match[1]) : 5;

            await this.publishEvent('break.started', { durationMinutes: duration, source: 'voice' });
            return `Starting ${duration}-minute break`;
        }

        // Create task
        if (lowerCommand.includes('create task') || lowerCommand.includes('add task')) {
            const taskMatch = command.match(/(?:create|add)\s+task[:\s]+(.+)/i);
            if (taskMatch) {
                const title = taskMatch[1].trim();
                await this.publishEvent('task.created', { title, source: 'voice' });
                return `Created task: ${title}`;
            }
        }

        // Get status
        if (lowerCommand.includes('status') || lowerCommand.includes('how am i doing')) {
            // Would return actual stats
            return 'You have completed 5 tasks today with 2 hours of focus time';
        }

        return 'Command not recognized. Try "start focus", "take a break", or "create task"';
    }

    // ============================================
    // Configuration
    // ============================================

    getConfig(): JarvisConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<JarvisConfig>): void {
        const wasEnabled = this.config.enabled;
        this.config = { ...this.config, ...updates };
        this.saveConfig();

        // Handle enable/disable
        if (!wasEnabled && this.config.enabled) {
            this.connect();
        } else if (wasEnabled && !this.config.enabled) {
            this.disconnect();
        }
    }

    getStatus(): JarvisConnectionStatus {
        return { ...this.status };
    }

    getEventQueue(): JarvisEvent[] {
        return [...this.eventQueue];
    }

    clearEventQueue(): void {
        this.eventQueue = [];
    }
}

// Singleton instance
export const jarvisBridgeService = new JarvisBridgeService();
export default jarvisBridgeService;
