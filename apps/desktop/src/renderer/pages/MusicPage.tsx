import { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { audioService, AmbientTrack, TrackInfo } from '../services/audio-service';

export default function MusicPage() {
    const [tracks] = useState<TrackInfo[]>(audioService.tracks);
    const [currentTrack, setCurrentTrack] = useState<AmbientTrack>('silence');
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const state = audioService.getState();
        setCurrentTrack(state.currentTrack);
        setIsPlaying(state.isPlaying);
        setVolume(state.musicVolume);
        setIsMuted(state.muted);
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Music className="w-7 h-7 text-primary-400" />
                    Music & Sounds
                </h1>
                <p className="text-dark-400">Ambient sounds to help you focus</p>
            </div>

            {/* Now Playing */}
            <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl border border-primary-500/30 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-dark-700 rounded-xl flex items-center justify-center text-3xl">
                            {getTrackIcon(currentTrack)}
                        </div>
                        <div>
                            <div className="text-sm text-primary-400 mb-1">Now Playing</div>
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
