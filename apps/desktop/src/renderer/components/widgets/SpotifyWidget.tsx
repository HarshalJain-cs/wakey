import { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface SpotifyTrack {
    name: string;
    artist: string;
    albumArt?: string;
    isPlaying: boolean;
    progress: number;
    duration: number;
}

export default function SpotifyWidget() {
    const [track, setTrack] = useState<SpotifyTrack | null>(null);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            if (window.wakey?.getSettings) {
                const settings = await window.wakey.getSettings();
                setConnected(!!settings.spotifyConnected);
            }
        } catch (error) {
            console.error('Failed to check Spotify connection:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        // Navigate to settings for Spotify connection
        if (window.wakey?.onNavigate) {
            // This will be implemented when Spotify OAuth is ready
            console.log('Navigate to Spotify settings');
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                </div>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <Music className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Spotify</h3>
                        <p className="text-xs text-dark-400">Not connected</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-dark-400 text-sm text-center mb-3">
                        Connect Spotify to control your music during focus sessions
                    </p>
                    <button
                        onClick={handleConnect}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                        Connect Spotify
                    </button>
                </div>
            </div>
        );
    }

    // Connected state with track info (placeholder for now)
    return (
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                    <Music className="w-4 h-4 text-green-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Spotify</h3>
                    <p className="text-xs text-green-400">Connected</p>
                </div>
            </div>

            {track ? (
                <div className="space-y-3">
                    {/* Album Art & Track Info */}
                    <div className="flex items-center gap-3">
                        {track.albumArt ? (
                            <img
                                src={track.albumArt}
                                alt="Album"
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
                                <Music className="w-6 h-6 text-dark-500" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{track.name}</p>
                            <p className="text-dark-400 text-xs truncate">{track.artist}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                        <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${(track.progress / track.duration) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-dark-500">
                            <span>{formatTime(track.progress)}</span>
                            <span>{formatTime(track.duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-3">
                        <button className="p-2 text-dark-400 hover:text-white transition-colors">
                            <SkipBack className="w-4 h-4" />
                        </button>
                        <button className="p-3 bg-green-500 rounded-full text-white hover:bg-green-600 transition-colors">
                            {track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <button className="p-2 text-dark-400 hover:text-white transition-colors">
                            <SkipForward className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-dark-400 hover:text-white transition-colors ml-2">
                            <Volume2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Music className="w-8 h-8 text-dark-600 mb-2" />
                    <p className="text-dark-400 text-sm">
                        No track playing
                    </p>
                    <p className="text-dark-500 text-xs mt-1">
                        Play something on Spotify
                    </p>
                </div>
            )}
        </div>
    );
}
