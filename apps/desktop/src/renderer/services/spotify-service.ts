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
    mobileNumber: string | null;
    userProfile: {
        displayName: string;
        email: string;
        image: string | null;
        isPremium: boolean;
    } | null;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    image: string;
    trackCount: number;
    uri: string;
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
            mobileNumber: null,
            userProfile: null,
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
     * Connect with mobile number - Opens Spotify OAuth
     * The mobile number is stored for reference and recovery
     */
    async connectWithMobile(mobileNumber: string): Promise<{ success: boolean; message: string }> {
        try {
            this.config.mobileNumber = mobileNumber;
            this.saveConfig();

            // Open Spotify OAuth in browser
            const authUrl = this.getAuthUrl();

            // Use Electron's shell to open in default browser
            if ((window as any).wakey?.openExternal) {
                (window as any).wakey.openExternal(authUrl);
            } else {
                window.open(authUrl, '_blank');
            }

            return {
                success: true,
                message: 'Spotify authorization page opened. Please log in with your Spotify account linked to ' + mobileNumber,
            };
        } catch (error) {
            console.error('Spotify connect error:', error);
            return {
                success: false,
                message: 'Failed to open Spotify authorization.',
            };
        }
    }

    /**
     * Get stored mobile number
     */
    getMobileNumber(): string | null {
        return this.config.mobileNumber;
    }

    /**
     * Get user profile
     */
    getUserProfile() {
        return this.config.userProfile;
    }

    /**
     * Handle OAuth callback
     */
    async handleAuthCallback(code: string): Promise<boolean> {
        // In production, exchange code for tokens via backend
        console.log('Would exchange Spotify auth code:', code);

        // Placeholder - simulates successful auth
        this.config.accessToken = 'demo_access_token';
        this.config.refreshToken = 'demo_refresh_token';
        this.config.expiresAt = Date.now() + 3600 * 1000;
        this.config.enabled = true;
        this.config.userProfile = {
            displayName: 'Spotify User',
            email: 'user@example.com',
            image: null,
            isPremium: true,
        };
        this.saveConfig();

        return true;
    }

    /**
     * Get focus-friendly playlists
     */
    async getFocusPlaylists(): Promise<SpotifyPlaylist[]> {
        if (!this.isConnected()) {
            // Return demo playlists
            return [
                { id: '1', name: 'Deep Focus', description: 'Keep calm and focus', image: '', trackCount: 100, uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ' },
                { id: '2', name: 'Lo-Fi Beats', description: 'Chill beats to relax', image: '', trackCount: 75, uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn' },
                { id: '3', name: 'Peaceful Piano', description: 'Peaceful piano to help you slow down', image: '', trackCount: 150, uri: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO' },
            ];
        }

        try {
            const response = await fetch(
                'https://api.spotify.com/v1/search?q=focus%20chill%20lofi&type=playlist&limit=10',
                { headers: { 'Authorization': `Bearer ${this.config.accessToken}` } }
            );

            if (!response.ok) return [];

            const data = await response.json();
            return data.playlists.items.map((p: any) => ({
                id: p.id,
                name: p.name,
                description: p.description || '',
                image: p.images?.[0]?.url || '',
                trackCount: p.tracks?.total || 0,
                uri: p.uri,
            }));
        } catch (error) {
            console.error('Get focus playlists error:', error);
            return [];
        }
    }

    /**
     * Play a specific playlist
     */
    async playPlaylist(playlistUri: string): Promise<boolean> {
        if (!this.isConnected()) return false;

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context_uri: playlistUri }),
            });

            return response.ok;
        } catch (error) {
            console.error('Play playlist error:', error);
            return false;
        }
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
        this.config.mobileNumber = null;
        this.config.userProfile = null;
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
