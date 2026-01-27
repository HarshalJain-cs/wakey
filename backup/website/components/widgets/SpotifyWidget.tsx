'use client';

import { useState, useEffect, useCallback } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, ExternalLink, Loader2 } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string | null;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
}

interface SpotifyStatus {
  connected: boolean;
  track: SpotifyTrack | null;
}

export default function SpotifyWidget() {
  const [status, setStatus] = useState<SpotifyStatus>({ connected: false, track: null });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [controlling, setControlling] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Spotify status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll for updates every 10 seconds when connected
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/spotify/auth');
      if (res.ok) {
        const { authUrl } = await res.json();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Failed to get Spotify auth URL:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/spotify/disconnect', { method: 'POST' });
      setStatus({ connected: false, track: null });
    } catch (error) {
      console.error('Failed to disconnect Spotify:', error);
    }
  };

  const handleControl = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (controlling) return;
    setControlling(true);
    try {
      const res = await fetch('/api/spotify/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Refresh status after control action
        setTimeout(fetchStatus, 500);
      }
    } catch (error) {
      console.error('Failed to control Spotify:', error);
    } finally {
      setControlling(false);
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
      <WidgetCard title="Spotify" icon={<Music className="w-5 h-5" />}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
        </div>
      </WidgetCard>
    );
  }

  if (!status.connected) {
    return (
      <WidgetCard title="Spotify" icon={<Music className="w-5 h-5" />}>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
            <Music className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-dark-400 text-sm text-center mb-4">
            Connect Spotify to control your music during focus sessions
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Music className="w-4 h-4" />
            )}
            Connect Spotify
          </button>
        </div>
      </WidgetCard>
    );
  }

  const track = status.track;

  return (
    <WidgetCard
      title="Spotify"
      icon={<Music className="w-5 h-5" />}
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-400">Connected</span>
          <button
            onClick={handleDisconnect}
            className="text-xs text-dark-500 hover:text-dark-300 transition-colors"
          >
            Disconnect
          </button>
        </div>
      }
    >
      {track ? (
        <div className="space-y-4">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            {track.albumArt ? (
              <img
                src={track.albumArt}
                alt="Album art"
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-dark-700 rounded-xl flex items-center justify-center">
                <Music className="w-8 h-8 text-dark-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{track.name}</p>
              <p className="text-dark-400 text-sm truncate">{track.artist}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${(track.progressMs / track.durationMs) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-dark-500">
              <span>{formatTime(track.progressMs)}</span>
              <span>{formatTime(track.durationMs)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleControl('previous')}
              disabled={controlling}
              className="p-3 text-dark-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleControl(track.isPlaying ? 'pause' : 'play')}
              disabled={controlling}
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-50"
            >
              {controlling ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : track.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => handleControl('next')}
              disabled={controlling}
              className="p-3 text-dark-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="p-3 text-dark-400 hover:text-white hover:bg-dark-700 rounded-full transition-colors ml-2">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Open in Spotify */}
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-dark-400 hover:text-green-400 transition-colors"
          >
            Open in Spotify
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Music className="w-12 h-12 text-dark-600 mb-3" />
          <p className="text-dark-400">No track playing</p>
          <p className="text-dark-500 text-sm mt-1">Play something on Spotify to see it here</p>
        </div>
      )}
    </WidgetCard>
  );
}
