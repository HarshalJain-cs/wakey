import { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, ChevronRight, Link2, Smartphone, User, ListMusic, LogOut } from 'lucide-react';
import { audioService, AmbientTrack, TrackInfo } from '../services/audio-service';
import spotifyService, { SpotifyTrack, SpotifyPlaylist } from '../services/spotify-service';

export default function MusicPage() {
    const [tracks] = useState<TrackInfo[]>(audioService.tracks);
    const [currentTrack, setCurrentTrack] = useState<AmbientTrack>('silence');
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    // Spotify state
    const [spotifyConnected, setSpotifyConnected] = useState(spotifyService.isConnected());
    const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [connectMessage, setConnectMessage] = useState('');
    const [focusPlaylists, setFocusPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [showSpotifyPanel, setShowSpotifyPanel] = useState(true);

    useEffect(() => {
        const state = audioService.getState();
        setCurrentTrack(state.currentTrack);
        setIsPlaying(state.isPlaying);
        setVolume(state.musicVolume);
        setIsMuted(state.muted);

        const handleToggle = () => handlePlayTrack(audioService.getState().currentTrack);
        const handleVolUp = () => {
            const newVol = Math.min(1, audioService.getState().musicVolume + 0.1);
            setVolume(newVol);
            audioService.setMusicVolume(newVol);
        };
        const handleVolDown = () => {
            const newVol = Math.max(0, audioService.getState().musicVolume - 0.1);
            setVolume(newVol);
            audioService.setMusicVolume(newVol);
        };

        window.addEventListener('music-toggle', handleToggle);
        window.addEventListener('music-vol-up', handleVolUp);
        window.addEventListener('music-vol-down', handleVolDown);

        // Load Spotify state
        const savedMobile = spotifyService.getMobileNumber();
        if (savedMobile) setMobileNumber(savedMobile);

        // Load focus playlists
        spotifyService.getFocusPlaylists().then(setFocusPlaylists);

        // Start Spotify polling if connected
        if (spotifyService.isConnected()) {
            spotifyService.startPolling(setSpotifyTrack, 5000);
        }

        return () => {
            window.removeEventListener('music-toggle', handleToggle);
            window.removeEventListener('music-vol-up', handleVolUp);
            window.removeEventListener('music-vol-down', handleVolDown);
            spotifyService.stopPolling();
        };
    }, []);

    const handlePlayTrack = (trackId: AmbientTrack) => {
        if (trackId === currentTrack && isPlaying) {
            audioService.stopMusic();
            setIsPlaying(false);
        } else {
            setCurrentTrack(trackId);
            audioService.playMusic(trackId);
            setIsPlaying(trackId !== 'silence');
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        audioService.setMusicVolume(newVolume);
    };

    const toggleMute = () => {
        audioService.toggleMute();
        setIsMuted(!isMuted);
    };

    const handleSpotifyConnect = async () => {
        if (!mobileNumber || mobileNumber.length < 10) {
            setConnectMessage('Please enter a valid mobile number');
            return;
        }

        const result = await spotifyService.connectWithMobile(mobileNumber);
        setConnectMessage(result.message);

        if (result.success) {
            // Simulate callback for demo
            setTimeout(async () => {
                await spotifyService.handleAuthCallback('demo-code');
                setSpotifyConnected(true);
                setConnectMessage('Successfully connected to Spotify!');
                spotifyService.startPolling(setSpotifyTrack, 5000);
                spotifyService.getFocusPlaylists().then(setFocusPlaylists);
            }, 2000);
        }
    };

    const handleSpotifyDisconnect = () => {
        spotifyService.disconnect();
        setSpotifyConnected(false);
        setSpotifyTrack(null);
        setFocusPlaylists([]);
        setConnectMessage('');
    };

    const handlePlayPlaylist = async (playlist: SpotifyPlaylist) => {
        await spotifyService.playPlaylist(playlist.uri);
    };

    const getTrackIcon = (trackId: string): string => {
        const icons: Record<string, string> = {
            'silence': '🔇',
            'lofi-beats': '🎵',
            'jazz-lounge': '🎷',
            'binaural-40hz': '🧠',
            'space-ambience': '🌌',
            'synthwave': '🎹',
            'bossa-nova': '🏖️',
            'coffee-shop': '☕',
            'relaxing-rain': '🌧️',
            'distant-waterfall': '💧',
            'calm-meditation': '🧘',
        };
        return icons[trackId] || '🎵';
    };

    const currentTrackInfo = tracks.find(t => t.id === currentTrack);
    const userProfile = spotifyService.getUserProfile();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Music className="w-7 h-7 text-primary-400" />
                    Music & Sounds
                </h1>
                <p className="text-dark-400">Ambient sounds and Spotify integration</p>
            </div>

            {/* Spotify Integration Panel */}
            <div className={`rounded-2xl border transition-all overflow-hidden ${spotifyConnected
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30'
                    : 'bg-dark-800 border-dark-700'
                }`}>
                {/* Header */}
                <button
                    onClick={() => setShowSpotifyPanel(!showSpotifyPanel)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-white">Spotify Integration</h3>
                            <p className="text-sm text-dark-400">
                                {spotifyConnected ? 'Connected' : 'Connect with your mobile number'}
                            </p>
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-dark-400 transition-transform ${showSpotifyPanel ? 'rotate-90' : ''}`} />
                </button>

                {/* Content */}
                {showSpotifyPanel && (
                    <div className="p-4 pt-0 space-y-4">
                        {!spotifyConnected ? (
                            /* Connect Form */
                            <div className="space-y-4">
                                <div className="bg-dark-700/50 rounded-xl p-4">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Smartphone className="w-5 h-5 text-green-400 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-white">Quick Connect</h4>
                                            <p className="text-sm text-dark-400">
                                                Enter your mobile number linked to Spotify to connect
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="tel"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value)}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSpotifyConnect}
                                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            <Link2 className="w-4 h-4" />
                                            Connect
                                        </button>
                                    </div>

                                    {connectMessage && (
                                        <p className={`mt-3 text-sm ${connectMessage.includes('Success') || connectMessage.includes('opened') ? 'text-green-400' : 'text-amber-400'}`}>
                                            {connectMessage}
                                        </p>
                                    )}
                                </div>

                                <p className="text-xs text-dark-500 text-center">
                                    This will open Spotify's login page in your browser
                                </p>
                            </div>
                        ) : (
                            /* Connected State */
                            <div className="space-y-4">
                                {/* User Profile */}
                                <div className="flex items-center justify-between bg-dark-700/50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                            {userProfile?.image ? (
                                                <img src={userProfile.image} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{userProfile?.displayName || 'Spotify User'}</h4>
                                            <p className="text-sm text-dark-400">{mobileNumber}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSpotifyDisconnect}
                                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Disconnect"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Now Playing from Spotify */}
                                {spotifyTrack && (
                                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={spotifyTrack.albumArt || 'https://via.placeholder.com/64'}
                                                alt={spotifyTrack.album}
                                                className="w-16 h-16 rounded-lg object-cover shadow-lg"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Now Playing on Spotify</p>
                                                <h4 className="font-medium text-white truncate">{spotifyTrack.name}</h4>
                                                <p className="text-sm text-dark-400 truncate">{spotifyTrack.artist}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => spotifyService.skipPrevious()}
                                                    className="p-2 text-dark-400 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => spotifyService.togglePlayback()}
                                                    className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                                                >
                                                    {spotifyTrack.isPlaying ? (
                                                        <Pause className="w-5 h-5" />
                                                    ) : (
                                                        <Play className="w-5 h-5 ml-0.5" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => spotifyService.skipNext()}
                                                    className="p-2 text-dark-400 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 transition-all"
                                                    style={{ width: `${(spotifyTrack.progressMs / spotifyTrack.durationMs) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 text-xs text-dark-500">
                                                <span>{spotifyService.formatDuration(spotifyTrack.progressMs)}</span>
                                                <span>{spotifyService.formatDuration(spotifyTrack.durationMs)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Focus Playlists */}
                                {focusPlaylists.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                                            <ListMusic className="w-4 h-4 text-green-400" />
                                            Focus Playlists
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {focusPlaylists.map(playlist => (
                                                <button
                                                    key={playlist.id}
                                                    onClick={() => handlePlayPlaylist(playlist)}
                                                    className="p-3 bg-dark-700/50 hover:bg-dark-700 rounded-lg text-left transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-lg flex items-center justify-center group-hover:from-green-500/50 group-hover:to-green-600/30 transition-colors">
                                                            <Play className="w-4 h-4 text-green-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="text-sm font-medium text-white truncate">{playlist.name}</h5>
                                                            <p className="text-xs text-dark-400">{playlist.trackCount} tracks</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Now Playing (Ambient) */}
            <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl border border-primary-500/30 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-dark-700 rounded-xl flex items-center justify-center text-3xl">
                            {getTrackIcon(currentTrack)}
                        </div>
                        <div>
                            <div className="text-sm text-primary-400 mb-1">Ambient Sounds</div>
                            <h2 className="text-xl font-bold text-white">
                                {currentTrackInfo?.name || 'Silence'}
                            </h2>
                            <p className="text-dark-400 text-sm">
                                {currentTrackInfo?.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMute}
                                className="p-2 text-dark-400 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-24 accent-primary-500"
                            />
                        </div>

                        {/* Play Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePlayTrack(currentTrack)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'bg-primary-500 text-white'
                                    }`}
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Library */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Sound Library</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tracks.map(track => (
                        <button
                            key={track.id}
                            onClick={() => handlePlayTrack(track.id)}
                            disabled={!track.available && track.id !== 'silence'}
                            className={`p-4 rounded-xl border text-left transition-all group ${currentTrack === track.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : track.available || track.id === 'silence'
                                    ? 'border-dark-700 bg-dark-800 hover:border-dark-600'
                                    : 'border-dark-700 bg-dark-800/50 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getTrackIcon(track.id)}</span>
                                    <div>
                                        <div className="font-medium text-white flex items-center gap-2">
                                            {track.name}
                                            {!track.available && track.id !== 'silence' && (
                                                <span className="text-xs px-2 py-0.5 bg-dark-700 text-dark-400 rounded">
                                                    Coming Soon
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-dark-400 text-sm">{track.description}</p>
                                    </div>
                                </div>

                                {currentTrack === track.id && isPlaying ? (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-4 bg-primary-500 rounded animate-pulse" />
                                        <div className="w-1 h-6 bg-primary-500 rounded animate-pulse" style={{ animationDelay: '75ms' }} />
                                        <div className="w-1 h-3 bg-primary-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                                    </div>
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-dark-400 transition-colors" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <p className="text-center text-dark-500 text-sm mt-6">
                    More ambient sounds coming soon! 🎵
                </p>
            </div>
        </div>
    );
}
