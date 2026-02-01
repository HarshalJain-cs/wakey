/**
 * @fileoverview Spotify Integration Service
 * 
 * Integration with Spotify for:
 * - Playing focus playlists
 * - Auto-pause on break
 * - Tracking music during focus
 * 
 * @module services/spotify-integration-service
 */

// ============================================
// Types
// ============================================

export interface SpotifyConfig {
    enabled: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: Date | null;
    userId: string | null;
    displayName: string | null;
    focusPlaylistId: string | null;
    autoPlayOnFocus: boolean;
    autoPauseOnBreak: boolean;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    imageUrl: string | null;
    trackCount: number;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    albumArt: string;
    durationMs: number;
}

// ============================================
// Spotify Integration Service
// ============================================

class SpotifyIntegrationService {
    private config: SpotifyConfig;
    private readonly CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // To be configured
    private readonly REDIRECT_URI = 'wakey://spotify/callback';
    private readonly SCOPES = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'playlist-read-private',
        'playlist-read-collaborative',
    ];

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): SpotifyConfig {
        try {
            const saved = localStorage.getItem('wakey_spotify_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
                };
            }
        } catch {
            console.error('Failed to load Spotify config');
        }
        return {
            enabled: false,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            userId: null,
            displayName: null,
            focusPlaylistId: null,
            autoPlayOnFocus: true,
            autoPauseOnBreak: true,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_spotify_config', JSON.stringify(this.config));
    }

    // Check if connected
    isConnected(): boolean {
        return this.config.enabled && !!this.config.accessToken;
    }

    // Get OAuth URL for authorization
    getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            response_type: 'code',
            redirect_uri: this.REDIRECT_URI,
            scope: this.SCOPES.join(' '),
            show_dialog: 'true',
        });
        return `https://accounts.spotify.com/authorize?${params}`;
    }

    // Connect with OAuth tokens (called after OAuth flow)
    async connect(accessToken: string, refreshToken: string, expiresIn: number): Promise<boolean> {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const user = await response.json();
                this.config = {
                    ...this.config,
                    enabled: true,
                    accessToken,
                    refreshToken,
                    expiresAt: new Date(Date.now() + expiresIn * 1000),
                    userId: user.id,
                    displayName: user.display_name,
                };
                this.saveConfig();
                return true;
            }
        } catch (error) {
            console.error('Spotify connection error:', error);
        }
        return false;
    }

    // Disconnect
    disconnect(): void {
        this.config = {
            enabled: false,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            userId: null,
            displayName: null,
            focusPlaylistId: null,
            autoPlayOnFocus: true,
            autoPauseOnBreak: true,
        };
        this.saveConfig();
    }

    // Get user's playlists
    async getPlaylists(): Promise<SpotifyPlaylist[]> {
        if (!this.isConnected()) return [];

        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
                headers: { 'Authorization': `Bearer ${this.config.accessToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                return data.items.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    imageUrl: p.images[0]?.url || null,
                    trackCount: p.tracks.total,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch Spotify playlists:', error);
        }

        return [];
    }

    // Play a playlist
    async playPlaylist(playlistId: string): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context_uri: `spotify:playlist:${playlistId}`,
                }),
            });
            return response.ok || response.status === 204;
        } catch (error) {
            console.error('Failed to play Spotify playlist:', error);
            return false;
        }
    }

    // Play focus playlist
    async playFocusPlaylist(): Promise<boolean> {
        if (!this.config.focusPlaylistId) return false;
        return this.playPlaylist(this.config.focusPlaylistId);
    }

    // Pause playback
    async pause(): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.config.accessToken}` },
            });
            return response.ok || response.status === 204;
        } catch (error) {
            console.error('Failed to pause Spotify:', error);
            return false;
        }
    }

    // Resume playback
    async resume(): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.config.accessToken}` },
            });
            return response.ok || response.status === 204;
        } catch (error) {
            console.error('Failed to resume Spotify:', error);
            return false;
        }
    }

    // Get currently playing
    async getCurrentTrack(): Promise<SpotifyTrack | null> {
        if (!this.isConnected()) return null;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${this.config.accessToken}` },
            });

            if (response.ok && response.status !== 204) {
                const data = await response.json();
                if (data.item) {
                    return {
                        id: data.item.id,
                        name: data.item.name,
                        artist: data.item.artists.map((a: any) => a.name).join(', '),
                        albumArt: data.item.album.images[0]?.url || '',
                        durationMs: data.item.duration_ms,
                    };
                }
            }
        } catch (error) {
            console.error('Failed to get current track:', error);
        }

        return null;
    }

    // Set focus playlist
    setFocusPlaylist(playlistId: string): void {
        this.config.focusPlaylistId = playlistId;
        this.saveConfig();
    }

    // Getters and setters
    getConfig(): SpotifyConfig {
        return { ...this.config };
    }

    updateConfig(updates: Partial<SpotifyConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
}

export const spotifyService = new SpotifyIntegrationService();
