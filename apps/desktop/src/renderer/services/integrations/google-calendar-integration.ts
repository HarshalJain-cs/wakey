// apps/desktop/src/renderer/services/integrations/google-calendar-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    status: 'confirmed' | 'tentative' | 'cancelled';
    attendees?: { email: string; responseStatus: string }[];
    htmlLink: string;
    colorId?: string;
}

interface GoogleCalendar {
    id: string;
    summary: string;
    primary?: boolean;
    backgroundColor?: string;
    accessRole: 'owner' | 'writer' | 'reader';
}

export class GoogleCalendarIntegration extends BaseIntegration {
    readonly id = 'google-calendar';
    readonly name = 'Google Calendar';
    readonly icon = '📅';
    readonly category = 'calendar' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        redirectUri: 'wakey://auth/google/callback',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token'
    };

    private cachedCalendars: GoogleCalendar[] = [];
    private cachedEvents: GoogleCalendarEvent[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Sync your Google Calendar events and block focus time',
            features: [
                'event-sync',
                'focus-time-blocking',
                'meeting-detection',
                'calendar-awareness',
                'automatic-time-blocking',
                'multi-calendar-support'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);
            await this.fetchCalendars();
            await this.sync();
            this.startPolling(5 * 60 * 1000); // Sync every 5 minutes
        } catch (error) {
            console.error('Google Calendar connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.stopPolling();
        await this.clearTokens();
        this.cachedCalendars = [];
        this.cachedEvents = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Get events for next 7 days
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const events = await this.fetchEvents(now, nextWeek);
            this.cachedEvents = events;

            // Detect meetings and update focus availability
            const meetings = events.filter(e => e.attendees && e.attendees.length > 0);
            await this.updateFocusAvailability(meetings);

            this.lastSyncAt = new Date();
            result.synced = events.length;
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async fetchCalendars(): Promise<GoogleCalendar[]> {
        const response = await fetch(
            'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status}`);
        }

        const data = await response.json();
        this.cachedCalendars = data.items || [];
        return this.cachedCalendars;
    }

    private async fetchEvents(start: Date, end: Date): Promise<GoogleCalendarEvent[]> {
        const allEvents: GoogleCalendarEvent[] = [];
        const primaryCalendar = this.cachedCalendars.find(c => c.primary) || this.cachedCalendars[0];

        if (!primaryCalendar) return [];

        const params = new URLSearchParams({
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime'
        });

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(primaryCalendar.id)}/events?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const data = await response.json();
        allEvents.push(...(data.items || []));

        return allEvents;
    }

    private async updateFocusAvailability(meetings: GoogleCalendarEvent[]): Promise<void> {
        // Update Wakey's focus availability based on meeting schedule
        for (const meeting of meetings) {
            const startTime = meeting.start.dateTime || meeting.start.date;
            const endTime = meeting.end.dateTime || meeting.end.date;

            console.log(`Meeting detected: ${meeting.summary} from ${startTime} to ${endTime}`);
            // Would update focus availability in the app
        }
    }

    async createFocusTimeBlock(title: string, start: Date, end: Date): Promise<GoogleCalendarEvent> {
        await this.ensureValidToken(this.config);

        const primaryCalendar = this.cachedCalendars.find(c => c.primary);
        if (!primaryCalendar) {
            throw new Error('No primary calendar found');
        }

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(primaryCalendar.id)}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    summary: title,
                    description: 'Focus time blocked by Wakey',
                    start: { dateTime: start.toISOString() },
                    end: { dateTime: end.toISOString() },
                    transparency: 'opaque',
                    colorId: '6' // Orange
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to create event: ${response.status}`);
        }

        const newEvent = await response.json();
        await this.sync();
        return newEvent;
    }

    async deleteEvent(eventId: string): Promise<void> {
        await this.ensureValidToken(this.config);

        const primaryCalendar = this.cachedCalendars.find(c => c.primary);
        if (!primaryCalendar) {
            throw new Error('No primary calendar found');
        }

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(primaryCalendar.id)}/events/${eventId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );

        if (!response.ok && response.status !== 404) {
            throw new Error(`Failed to delete event: ${response.status}`);
        }
    }

    getUpcomingEvents(hours: number = 24): GoogleCalendarEvent[] {
        const now = new Date();
        const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);

        return this.cachedEvents.filter(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date || '');
            return eventStart >= now && eventStart <= cutoff;
        });
    }

    getCalendars(): GoogleCalendar[] {
        return this.cachedCalendars;
    }
}

export const googleCalendarIntegration = new GoogleCalendarIntegration();
