/**
 * @fileoverview Google Calendar Integration Service
 * 
 * Integrates with Google Calendar API for:
 * - Fetching upcoming events
 * - Detecting meeting times
 * - Auto-creating tasks from calendar events
 */

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    attendees: string[];
    isAllDay: boolean;
    meetingLink?: string;
    status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface CalendarConfig {
    enabled: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    calendarId: string;
    syncEvents: boolean;
    autoBlockFocus: boolean; // Block focus time during meetings
    reminderMinutes: number;
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
];

class GoogleCalendarService {
    private config: CalendarConfig;
    private events: CalendarEvent[] = [];
    private _lastSync: Date | null = null;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): CalendarConfig {
        try {
            const stored = localStorage.getItem('wakey_google_calendar');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load calendar config:', error);
        }

        return {
            enabled: false,
            accessToken: null,
            refreshToken: null,
            calendarId: 'primary',
            syncEvents: true,
            autoBlockFocus: true,
            reminderMinutes: 5,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_google_calendar', JSON.stringify(this.config));
    }

    /**
     * Check if Google Calendar is configured
     */
    isConfigured(): boolean {
        return !!this.config.accessToken && this.config.enabled;
    }

    /**
     * Get OAuth URL for Google sign-in
     */
    getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: 'http://localhost:5173/auth/google/callback',
            response_type: 'code',
            scope: GOOGLE_SCOPES.join(' '),
            access_type: 'offline',
            prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    /**
     * Handle OAuth callback and exchange code for tokens
     */
    async handleAuthCallback(code: string): Promise<boolean> {
        // In a real implementation, this would call your backend to exchange the code
        // For now, we'll simulate the token storage
        console.log('Would exchange auth code:', code);

        // Placeholder - in production, call your backend
        this.config.accessToken = 'demo_access_token';
        this.config.refreshToken = 'demo_refresh_token';
        this.config.enabled = true;
        this.saveConfig();

        return true;
    }

    /**
     * Fetch events from Google Calendar
     */
    async fetchEvents(daysAhead: number = 7): Promise<CalendarEvent[]> {
        if (!this.isConfigured()) {
            // Return demo events for preview
            return this.getDemoEvents();
        }

        try {
            // timeMin/timeMax would be used with real Google Calendar API
            const timeMax = new Date();
            timeMax.setDate(timeMax.getDate() + daysAhead);

            // In production, this would call the Google Calendar API
            // For demo purposes, return sample events
            const events = this.getDemoEvents();
            this.events = events;
            this._lastSync = new Date();

            return events;
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
            return [];
        }
    }

    /**
     * Get demo events for preview/testing
     */
    private getDemoEvents(): CalendarEvent[] {
        const now = new Date();
        const events: CalendarEvent[] = [];

        // Today's standup
        const standup = new Date(now);
        standup.setHours(9, 30, 0, 0);
        events.push({
            id: 'demo_1',
            title: 'Daily Standup',
            start: standup,
            end: new Date(standup.getTime() + 15 * 60000),
            attendees: ['team@company.com'],
            isAllDay: false,
            status: 'confirmed',
            meetingLink: 'https://meet.google.com/abc-defg-hij',
        });

        // Afternoon meeting
        const meeting = new Date(now);
        meeting.setHours(14, 0, 0, 0);
        events.push({
            id: 'demo_2',
            title: 'Sprint Planning',
            description: 'Plan next sprint tasks and priorities',
            start: meeting,
            end: new Date(meeting.getTime() + 60 * 60000),
            attendees: ['product@company.com', 'dev@company.com'],
            isAllDay: false,
            status: 'confirmed',
        });

        // Tomorrow's 1:1
        const oneOnOne = new Date(now);
        oneOnOne.setDate(oneOnOne.getDate() + 1);
        oneOnOne.setHours(11, 0, 0, 0);
        events.push({
            id: 'demo_3',
            title: '1:1 with Manager',
            start: oneOnOne,
            end: new Date(oneOnOne.getTime() + 30 * 60000),
            attendees: ['manager@company.com'],
            isAllDay: false,
            status: 'confirmed',
        });

        return events.filter(e => e.start >= now);
    }

    /**
     * Get today's events
     */
    getTodayEvents(): CalendarEvent[] {
        const today = new Date().toISOString().split('T')[0];
        return this.events.filter(e =>
            e.start.toISOString().split('T')[0] === today
        );
    }

    /**
     * Get upcoming event (next meeting)
     */
    getNextEvent(): CalendarEvent | null {
        const now = new Date();
        const upcoming = this.events
            .filter(e => e.start > now && e.status !== 'cancelled')
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        return upcoming[0] || null;
    }

    /**
     * Check if currently in a meeting
     */
    isInMeeting(): CalendarEvent | null {
        const now = new Date();
        return this.events.find(e =>
            e.start <= now && e.end > now && e.status === 'confirmed'
        ) || null;
    }

    /**
     * Get minutes until next meeting
     */
    getMinutesUntilNextMeeting(): number | null {
        const next = this.getNextEvent();
        if (!next) return null;

        return Math.round((next.start.getTime() - Date.now()) / 60000);
    }

    /**
     * Create task from calendar event
     */
    createTaskFromEvent(event: CalendarEvent): {
        title: string;
        description: string;
        dueDate: Date;
        tags: string[];
    } {
        return {
            title: `Prepare for: ${event.title}`,
            description: event.description || `Meeting preparation for ${event.title}`,
            dueDate: new Date(event.start.getTime() - 30 * 60000), // 30 min before
            tags: ['meeting', 'calendar'],
        };
    }

    /**
     * Get last sync time
     */
    getLastSync(): Date | null {
        return this._lastSync;
    }

    /**
     * Disconnect Google Calendar
     */
    disconnect(): void {
        this.config.accessToken = null;
        this.config.refreshToken = null;
        this.config.enabled = false;
        this.events = [];
        this.saveConfig();
    }

    /**
     * Get configuration
     */
    getConfig(): CalendarConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(updates: Partial<CalendarConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
}

export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
