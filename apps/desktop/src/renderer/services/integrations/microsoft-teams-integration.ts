// apps/desktop/src/renderer/services/integrations/microsoft-teams-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationConfig,
    IntegrationMetadata
} from './base-integration';

interface TeamsUser {
    id: string;
    displayName: string;
    mail: string;
    userPrincipalName: string;
}

interface TeamsPresence {
    id: string;
    availability: 'Available' | 'Busy' | 'DoNotDisturb' | 'BeRightBack' | 'Away' | 'Offline';
    activity: string;
}

interface TeamsChannel {
    id: string;
    displayName: string;
    description?: string;
    membershipType: 'standard' | 'private' | 'shared';
}

interface TeamsTeam {
    id: string;
    displayName: string;
    description?: string;
}

interface TeamsMeeting {
    id: string;
    subject: string;
    startDateTime: string;
    endDateTime: string;
    joinWebUrl: string;
    organizer: { emailAddress: { name: string; address: string } };
}

export class MicrosoftTeamsIntegration extends BaseIntegration {
    readonly id = 'microsoft-teams';
    readonly name = 'Microsoft Teams';
    readonly icon = '👥';
    readonly category = 'communication' as const;
    readonly authType = 'oauth2' as const;

    private config: IntegrationConfig = {
        clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET,
        redirectUri: 'wakey://auth/microsoft/callback',
        scope: 'User.Read Presence.ReadWrite.All Team.ReadBasic.All Calendars.Read offline_access',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    };

    private currentUser?: TeamsUser;
    private originalPresence?: string;
    private cachedTeams: TeamsTeam[] = [];
    private cachedMeetings: TeamsMeeting[] = [];

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Sync Teams presence, meetings, and enable DND during focus',
            features: [
                'presence-sync',
                'dnd-during-focus',
                'meeting-detection',
                'calendar-awareness',
                'status-update'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        try {
            const tokens = await this.performOAuthFlow(this.config);
            await this.saveTokens(tokens);
            await this.fetchCurrentUser();
            await this.sync();
            this.startPolling(60 * 1000); // Check every minute
        } catch (error) {
            console.error('Microsoft Teams connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        // Restore original presence
        if (this.originalPresence) {
            await this.setPresence(this.originalPresence as any);
        }
        this.stopPolling();
        await this.clearTokens();
        this.currentUser = undefined;
        this.cachedTeams = [];
        this.cachedMeetings = [];
    }

    async sync(): Promise<SyncResult> {
        await this.ensureValidToken(this.config);

        const result: SyncResult = { created: 0, updated: 0, deleted: 0, synced: 0, errors: [] };

        try {
            // Fetch upcoming meetings
            const meetings = await this.fetchUpcomingMeetings();
            this.cachedMeetings = meetings;

            // Fetch teams
            const teams = await this.fetchTeams();
            this.cachedTeams = teams;

            this.lastSyncAt = new Date();
            result.synced = meetings.length + teams.length;
        } catch (error) {
            result.errors?.push(String(error));
        }

        return result;
    }

    private async fetchCurrentUser(): Promise<TeamsUser> {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Microsoft Graph API error: ${response.status}`);
        }

        this.currentUser = await response.json();
        return this.currentUser!;
    }

    private async fetchUpcomingMeetings(): Promise<TeamsMeeting[]> {
        const now = new Date();
        const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next 24 hours

        const response = await fetch(
            `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${now.toISOString()}&endDateTime=${endDate.toISOString()}&$filter=isOnlineMeeting eq true`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch meetings: ${response.status}`);
        }

        const data = await response.json();
        return data.value;
    }

    private async fetchTeams(): Promise<TeamsTeam[]> {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch teams: ${response.status}`);
        }

        const data = await response.json();
        return data.value;
    }

    async getCurrentPresence(): Promise<TeamsPresence> {
        await this.ensureValidToken(this.config);

        const response = await fetch('https://graph.microsoft.com/v1.0/me/presence', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get presence: ${response.status}`);
        }

        return response.json();
    }

    async setFocusPresence(focusMinutes: number): Promise<void> {
        await this.ensureValidToken(this.config);

        // Save original presence
        if (!this.originalPresence) {
            const current = await this.getCurrentPresence();
            this.originalPresence = current.availability;
        }

        // Set to Do Not Disturb
        await this.setPresence('DoNotDisturb', 'Focusing', focusMinutes);
    }

    async clearFocusPresence(): Promise<void> {
        if (this.originalPresence) {
            await this.setPresence(this.originalPresence as any);
            this.originalPresence = undefined;
        }
    }

    private async setPresence(
        availability: 'Available' | 'Busy' | 'DoNotDisturb' | 'BeRightBack' | 'Away',
        activity?: string,
        expirationMinutes?: number
    ): Promise<void> {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/presence/setPresence', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
                availability,
                activity: activity || availability,
                expirationDuration: expirationMinutes ? `PT${expirationMinutes}M` : undefined
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.warn('Failed to set presence:', error);
            // Don't throw - presence setting might not be available for all users
        }
    }

    async getTeamChannels(teamId: string): Promise<TeamsChannel[]> {
        await this.ensureValidToken(this.config);

        const response = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch channels: ${response.status}`);
        }

        const data = await response.json();
        return data.value;
    }

    getCurrentUser(): TeamsUser | undefined {
        return this.currentUser;
    }

    getTeams(): TeamsTeam[] {
        return this.cachedTeams;
    }

    getUpcomingMeetings(): TeamsMeeting[] {
        return this.cachedMeetings;
    }
}

export const microsoftTeamsIntegration = new MicrosoftTeamsIntegration();
