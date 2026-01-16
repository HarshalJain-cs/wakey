/**
 * @fileoverview Spotify Now Playing Service
 * 
 * Integrates with Spotify Web API to:
 * - Show currently playing track
 * - Control playback
 * - Provide music-based productivity context
 */

export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    durationMs: number;
    progressMs: number;
    isPlaying: boolean;
    uri: string;
}

export interface SpotifyConfig {
    enabled: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
}

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_SCOPES = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
];

class SpotifyService {
    private config: SpotifyConfig;
    private currentTrack: SpotifyTrack | null = null;
    private pollInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): SpotifyConfig {
        try {
            const stored = localStorage.getItem('wakey_spotify');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load Spotify config:', error);
        }

        return {
            enabled: false,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_spotify', JSON.stringify(this.config));
    }

    /**
     * Check if Spotify is connected
     */
    isConnected(): boolean {
        if (!this.config.accessToken || !this.config.enabled) return false;
        if (this.config.expiresAt && Date.now() > this.config.expiresAt) return false;
        return true;
    }

    /**
     * Get OAuth URL for Spotify sign-in
     */
    getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri: 'http://localhost:5173/auth/spotify/callback',
            scope: SPOTIFY_SCOPES.join(' '),
            show_dialog: 'true',
        });

        return `https://accounts.spotify.com/authorize?${params}`;
    }

    /**
     * Handle OAuth callback
     */
    async handleAuthCallback(code: string): Promise<boolean> {
        // In production, exchange code for tokens via backend
        console.log('Would exchange Spotify auth code:', code);

        // Placeholder
        this.config.accessToken = 'demo_access_token';
        this.config.refreshToken = 'demo_refresh_token';
        this.config.expiresAt = Date.now() + 3600 * 1000;
        this.config.enabled = true;
        this.saveConfig();

        return true;
    }

    /**
     * Get currently playing track
     */
    async getNowPlaying(): Promise<SpotifyTrack | null> {
        if (!this.isConnected()) {
            // Return demo data
            return this.getDemoTrack();
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                },
            });

            if (response.status === 204) {
                return null; // Nothing playing
            }

            if (!response.ok) {
                throw new Error('Spotify API request failed');
            }

            const data = await response.json();

            this.currentTrack = {
                id: data.item.id,
                name: data.item.name,
                artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
                album: data.item.album.name,
                albumArt: data.item.album.images[0]?.url || '',
                durationMs: data.item.duration_ms,
                progressMs: data.progress_ms,
                isPlaying: data.is_playing,
                uri: data.item.uri,
            };

            return this.currentTrack;
        } catch (error) {
            console.error('Failed to get now playing:', error);
            return this.getDemoTrack();
        }
    }

    /**
     * Get demo track for preview
     */
    private getDemoTrack(): SpotifyTrack {
        return {
            id: 'demo',
            name: 'Lofi Study Beats',
            artist: 'Chillhop Music',
            album: 'Chillhop Essentials',
            albumArt: 'https://via.placeholder.com/64',
            durationMs: 180000,
            progressMs: 60000,
            isPlaying: true,
            uri: 'spotify:track:demo',
        };
    }

    /**
     * Play/Pause toggle
     */
    async togglePlayback(): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const endpoint = this.currentTrack?.isPlaying ? 'pause' : 'play';
            const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to toggle playback:', error);
            return false;
        }
    }

    /**
     * Skip to next track
     */
    async skipNext(): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to skip track:', error);
            return false;
        }
    }

    /**
     * Skip to previous track
     */
    async skipPrevious(): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to skip previous:', error);
            return false;
        }
    }

    /**
     * Start polling for now playing updates
     */
    startPolling(callback: (track: SpotifyTrack | null) => void, intervalMs: number = 5000): void {
        this.stopPolling();

        this.pollInterval = setInterval(async () => {
            const track = await this.getNowPlaying();
            callback(track);
        }, intervalMs);

        // Initial fetch
        this.getNowPlaying().then(callback);
    }

    /**
     * Stop polling
     */
    stopPolling(): void {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    /**
     * Get current track
     */
    getCurrentTrack(): SpotifyTrack | null {
        return this.currentTrack;
    }

    /**
     * Format track duration
     */
    formatDuration(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Disconnect Spotify
     */
    disconnect(): void {
        this.stopPolling();
        this.config.accessToken = null;
        this.config.refreshToken = null;
        this.config.expiresAt = null;
        this.config.enabled = false;
        this.currentTrack = null;
        this.saveConfig();
    }

    /**
     * Get configuration
     */
    getConfig(): SpotifyConfig {
        return { ...this.config };
    }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
