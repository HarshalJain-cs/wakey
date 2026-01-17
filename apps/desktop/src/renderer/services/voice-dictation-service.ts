/**
 * @fileoverview Voice Dictation Service
 * 
 * Voice input capabilities for JARVIS integration:
 * - Speech-to-text for notes
 * - Voice commands
 * - Dictation mode for tasks
 * 
 * Uses Web Speech API for browser-based recognition.
 * 
 * @module services/voice-dictation-service
 */

// Web Speech API Types (for TypeScript)
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

// ============================================
// Types
// ============================================

export interface VoiceConfig {
    enabled: boolean;
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    autoSend: boolean;
    wakeWord: string | null;
    confirmCommands: boolean;
}

export interface VoiceCommand {
    pattern: RegExp;
    handler: (matches: RegExpMatchArray) => Promise<string>;
    description: string;
    category: 'navigation' | 'focus' | 'tasks' | 'notes' | 'system';
}

export interface TranscriptEntry {
    id: string;
    text: string;
    confidence: number;
    timestamp: Date;
    isFinal: boolean;
    isCommand: boolean;
    commandResult: string | null;
}

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// ============================================
// Voice Dictation Service
// ============================================

class VoiceDictationService {
    private config: VoiceConfig;
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis | null = null;
    private status: VoiceStatus = 'idle';
    private transcript: TranscriptEntry[] = [];
    private commands: VoiceCommand[] = [];
    private listeners: Map<string, (data: unknown) => void> = new Map();

    constructor() {
        this.config = this.loadConfig();
        this.initializeWebSpeech();
        this.registerDefaultCommands();
    }

    private loadConfig(): VoiceConfig {
        try {
            const stored = localStorage.getItem('wakey_voice_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load voice config:', error);
        }

        return {
            enabled: true,
            language: 'en-US',
            continuous: true,
            interimResults: true,
            maxAlternatives: 1,
            autoSend: true,
            wakeWord: 'hey wakey',
            confirmCommands: false,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_voice_config', JSON.stringify(this.config));
    }

    // ============================================
    // Initialization
    // ============================================

    private initializeWebSpeech(): void {
        // Check for browser support
        const SpeechRecognitionAPI = (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            this.recognition = new SpeechRecognitionAPI();
            this.setupRecognition();
        } else {
            console.warn('Speech Recognition not supported in this browser');
        }

        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        } else {
            console.warn('Speech Synthesis not supported in this browser');
        }
    }

    private setupRecognition(): void {
        if (!this.recognition) return;

        this.recognition.lang = this.config.language;
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;
        this.recognition.maxAlternatives = this.config.maxAlternatives;

        this.recognition.onstart = () => {
            this.status = 'listening';
            this.emit('status', this.status);
            console.log('[Voice] Listening...');
        };

        this.recognition.onend = () => {
            this.status = 'idle';
            this.emit('status', this.status);
            console.log('[Voice] Stopped listening');

            // Restart if continuous mode
            if (this.config.continuous && this.config.enabled) {
                setTimeout(() => this.startListening(), 100);
            }
        };

        this.recognition.onresult = async (event: SpeechRecognitionEvent) => {
            await this.handleRecognitionResult(event);
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[Voice] Recognition error:', event.error);
            this.status = 'error';
            this.emit('status', this.status);
            this.emit('error', event.error);
        };
    }

    // ============================================
    // Recognition Handling
    // ============================================

    private async handleRecognitionResult(event: SpeechRecognitionEvent): Promise<void> {
        const results = event.results;

        for (let i = event.resultIndex; i < results.length; i++) {
            const result = results[i];
            const text = result[0].transcript.trim();
            const confidence = result[0].confidence;
            const isFinal = result.isFinal;

            // Create transcript entry
            const entry: TranscriptEntry = {
                id: `trans_${Date.now()}`,
                text,
                confidence,
                timestamp: new Date(),
                isFinal,
                isCommand: false,
                commandResult: null,
            };

            // Check for wake word
            if (this.config.wakeWord && !text.toLowerCase().startsWith(this.config.wakeWord.toLowerCase())) {
                // If wake word is set and not detected, only process if continuous mode
                if (!this.config.continuous) {
                    continue;
                }
            }

            // Remove wake word from text if present
            let processedText = text;
            if (this.config.wakeWord) {
                const wakeWordRegex = new RegExp(`^${this.config.wakeWord}[,.]?\\s*`, 'i');
                processedText = text.replace(wakeWordRegex, '');
            }

            // Check if it's a command
            if (isFinal) {
                const commandResult = await this.processCommand(processedText);
                if (commandResult) {
                    entry.isCommand = true;
                    entry.commandResult = commandResult;
                }
            }

            // Add to transcript
            this.transcript.push(entry);
            this.emit('transcript', entry);

            // Keep only last 100 entries
            if (this.transcript.length > 100) {
                this.transcript = this.transcript.slice(-100);
            }
        }
    }

    // ============================================
    // Command Processing
    // ============================================

    private registerDefaultCommands(): void {
        // Focus commands
        this.registerCommand(
            /^start\s+(?:a\s+)?(?:(\d+)\s*(?:minute)?\s+)?focus(?:\s+session)?$/i,
            async (matches) => {
                const duration = matches[1] ? parseInt(matches[1]) : 25;
                // Would trigger focus session start
                this.emit('command', { type: 'start_focus', duration });
                return `Starting ${duration}-minute focus session`;
            },
            'Start a focus session',
            'focus'
        );

        this.registerCommand(
            /^stop\s+(?:the\s+)?focus(?:\s+session)?$/i,
            async () => {
                this.emit('command', { type: 'stop_focus' });
                return 'Stopping focus session';
            },
            'Stop the current focus session',
            'focus'
        );

        this.registerCommand(
            /^take\s+(?:a\s+)?(?:(\d+)\s*(?:minute)?\s+)?break$/i,
            async (matches) => {
                const duration = matches[1] ? parseInt(matches[1]) : 5;
                this.emit('command', { type: 'start_break', duration });
                return `Starting ${duration}-minute break`;
            },
            'Take a break',
            'focus'
        );

        // Task commands
        this.registerCommand(
            /^(?:create|add|new)\s+task[:\s]+(.+)$/i,
            async (matches) => {
                const title = matches[1].trim();
                this.emit('command', { type: 'create_task', title });
                return `Created task: ${title}`;
            },
            'Create a new task',
            'tasks'
        );

        this.registerCommand(
            /^complete\s+task[:\s]+(.+)$/i,
            async (matches) => {
                const title = matches[1].trim();
                this.emit('command', { type: 'complete_task', title });
                return `Completed task: ${title}`;
            },
            'Complete a task',
            'tasks'
        );

        this.registerCommand(
            /^(?:show\s+)?(?:my\s+)?tasks$/i,
            async () => {
                this.emit('command', { type: 'show_tasks' });
                return 'Showing your tasks';
            },
            'Show all tasks',
            'tasks'
        );

        // Note commands
        this.registerCommand(
            /^(?:create|add|new)\s+note[:\s]+(.+)$/i,
            async (matches) => {
                const content = matches[1].trim();
                this.emit('command', { type: 'create_note', content });
                return `Created note: ${content.substring(0, 30)}...`;
            },
            'Create a new note',
            'notes'
        );

        // Navigation commands
        this.registerCommand(
            /^(?:go\s+to|open|show)\s+(dashboard|focus|tasks|analytics|settings|goals|achievements)$/i,
            async (matches) => {
                const page = matches[1].toLowerCase();
                this.emit('command', { type: 'navigate', page });
                return `Opening ${page}`;
            },
            'Navigate to a page',
            'navigation'
        );

        // System commands
        this.registerCommand(
            /^(?:what's\s+my\s+)?status$/i,
            async () => {
                this.emit('command', { type: 'get_status' });
                return 'Getting your status...';
            },
            'Get current status',
            'system'
        );

        this.registerCommand(
            /^(?:toggle\s+)?tracking$/i,
            async () => {
                this.emit('command', { type: 'toggle_tracking' });
                return 'Toggling activity tracking';
            },
            'Toggle activity tracking',
            'system'
        );

        this.registerCommand(
            /^help$/i,
            async () => {
                const commands = this.getAvailableCommands();
                const helpText = commands.map(c => c.description).join(', ');
                return `Available commands: ${helpText}`;
            },
            'Show available commands',
            'system'
        );
    }

    /**
     * Register a custom command
     */
    registerCommand(
        pattern: RegExp,
        handler: (matches: RegExpMatchArray) => Promise<string>,
        description: string,
        category: VoiceCommand['category']
    ): void {
        this.commands.push({ pattern, handler, description, category });
    }

    /**
     * Process a command
     */
    private async processCommand(text: string): Promise<string | null> {
        for (const command of this.commands) {
            const matches = text.match(command.pattern);
            if (matches) {
                this.status = 'processing';
                this.emit('status', this.status);

                try {
                    const result = await command.handler(matches);

                    // Speak the result if speech synthesis is available
                    if (this.synthesis && result) {
                        this.speak(result);
                    }

                    return result;
                } catch (error) {
                    console.error('[Voice] Command error:', error);
                    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                }
            }
        }
        return null;
    }

    // ============================================
    // Public API
    // ============================================

    /**
     * Start listening
     */
    startListening(): void {
        if (!this.recognition) {
            console.error('[Voice] Recognition not available');
            return;
        }

        if (!this.config.enabled) {
            console.log('[Voice] Voice dictation is disabled');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            // Already listening
            console.log('[Voice] Already listening');
        }
    }

    /**
     * Stop listening
     */
    stopListening(): void {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    /**
     * Toggle listening
     */
    toggleListening(): void {
        if (this.status === 'listening') {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    /**
     * Speak text
     */
    speak(text: string): void {
        if (!this.synthesis) {
            console.log('[Voice] Speech synthesis not available');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.config.language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            this.status = 'speaking';
            this.emit('status', this.status);
        };

        utterance.onend = () => {
            this.status = 'idle';
            this.emit('status', this.status);
        };

        this.synthesis.speak(utterance);
    }

    /**
     * Cancel speaking
     */
    cancelSpeaking(): void {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    /**
     * Get status
     */
    getStatus(): VoiceStatus {
        return this.status;
    }

    /**
     * Get transcript
     */
    getTranscript(limit: number = 20): TranscriptEntry[] {
        return this.transcript.slice(-limit);
    }

    /**
     * Clear transcript
     */
    clearTranscript(): void {
        this.transcript = [];
    }

    /**
     * Get available commands
     */
    getAvailableCommands(): VoiceCommand[] {
        return this.commands;
    }

    /**
     * Check if speech recognition is supported
     */
    isSupported(): boolean {
        return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }

    /**
     * Check if speech synthesis is supported
     */
    isSynthesisSupported(): boolean {
        return 'speechSynthesis' in window;
    }

    // ============================================
    // Event Emitter
    // ============================================

    /**
     * Subscribe to events
     */
    on(event: string, callback: (data: unknown) => void): void {
        this.listeners.set(event, callback);
    }

    /**
     * Unsubscribe from events
     */
    off(event: string): void {
        this.listeners.delete(event);
    }

    private emit(event: string, data: unknown): void {
        const listener = this.listeners.get(event);
        if (listener) {
            listener(data);
        }
    }

    // ============================================
    // Configuration
    // ============================================

    getConfig(): VoiceConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<VoiceConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();

        // Re-setup recognition with new settings
        if (this.recognition) {
            this.setupRecognition();
        }
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    toggle(): void {
        this.config.enabled = !this.config.enabled;
        this.saveConfig();

        if (!this.config.enabled) {
            this.stopListening();
        }
    }
}

// Singleton instance
export const voiceDictationService = new VoiceDictationService();
export default voiceDictationService;
