/**
 * @fileoverview Audio Service for Wakey
 * 
 * Handles all audio playback including:
 * - Timer completion sounds
 * - Break reminder sounds
 * - Ambient music library
 * 
 * @module services/audio-service
 */

// ============================================
// Types
// ============================================

/**
 * Available sound effects
 */
export type SoundEffect =
    | 'timer-complete'
    | 'break-start'
    | 'break-end'
    | 'distraction-alert'
    | 'achievement'
    | 'click';

/**
 * Available ambient music tracks
 */
export type AmbientTrack =
    | 'silence'
    | 'lofi-beats'
    | 'jazz-lounge'
    | 'binaural-40hz'
    | 'space-ambience'
    | 'synthwave'
    | 'bossa-nova'
    | 'coffee-shop'
    | 'relaxing-rain'
    | 'distant-waterfall'
    | 'calm-meditation';

/**
 * Track metadata
 */
export interface TrackInfo {
    id: AmbientTrack;
    name: string;
    description: string;
    duration?: number;
    available: boolean;
}

// ============================================
// Audio Service
// ============================================

/**
 * Audio service configuration
 */
interface AudioConfig {
    masterVolume: number;
    musicVolume: number;
    effectsVolume: number;
    muted: boolean;
}

class AudioService {
    private config: AudioConfig = {
        masterVolume: 0.7,
        musicVolume: 0.5,
        effectsVolume: 0.8,
        muted: false,
    };

    private currentTrack: AmbientTrack = 'silence';
    private musicPlayer: HTMLAudioElement | null = null;
    private isPlaying = false;

    /**
     * All available ambient tracks with metadata
     */
    readonly tracks: TrackInfo[] = [
        { id: 'silence', name: 'Silence', description: 'Sometimes silence is golden.', available: true },
        { id: 'lofi-beats', name: 'Lo-Fi Beats', description: 'Cozy downtempo and low-fidelity beats.', available: true },
        { id: 'jazz-lounge', name: 'Jazz Lounge', description: 'Best lounge music for study and focus.', available: false },
        { id: 'binaural-40hz', name: 'Binaural 40 Hz', description: 'Stimulate your brain with a binaural tone.', available: false },
        { id: 'space-ambience', name: 'Space Ambience', description: 'Journey through space and time.', available: true },
        { id: 'synthwave', name: 'Synthwave', description: 'Beats for a retro-futuristic odyssey.', available: false },
        { id: 'bossa-nova', name: 'Seaside Bossa Nova', description: 'Chill at the beach with some bossa nova.', available: false },
        { id: 'coffee-shop', name: 'Coffee Shop', description: 'Immerse yourself in a virtual coffee shop.', available: true },
        { id: 'relaxing-rain', name: 'Relaxing Rain', description: 'Enjoy the sound of rain on leaves.', available: false },
        { id: 'distant-waterfall', name: 'Distant Waterfall', description: 'Dive into the gentle rumbles of serenity.', available: false },
        { id: 'calm-meditation', name: 'Calm Meditation', description: '10-min reconnection with the present.', available: false },
    ];

    /**
     * Plays a sound effect
     */
    playEffect(effect: SoundEffect): void {
        if (this.config.muted) return;

        // Generate sound using Web Audio API (no external files needed)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure based on effect type
        switch (effect) {
            case 'timer-complete':
                oscillator.frequency.value = 880; // A5
                gainNode.gain.value = this.config.effectsVolume * this.config.masterVolume;
                oscillator.type = 'sine';
                this.playTone(audioContext, oscillator, gainNode, 0.3, [880, 1046, 1318]); // A5-C6-E6
                break;
            case 'break-start':
                oscillator.frequency.value = 523; // C5
                gainNode.gain.value = this.config.effectsVolume * this.config.masterVolume * 0.5;
                oscillator.type = 'sine';
                this.playTone(audioContext, oscillator, gainNode, 0.2, [523, 659]); // C5-E5
                break;
            case 'break-end':
                oscillator.frequency.value = 440; // A4
                gainNode.gain.value = this.config.effectsVolume * this.config.masterVolume;
                oscillator.type = 'triangle';
                this.playTone(audioContext, oscillator, gainNode, 0.4, [440, 554, 659]); // A4-C#5-E5
                break;
            case 'distraction-alert':
                oscillator.frequency.value = 220; // A3
                gainNode.gain.value = this.config.effectsVolume * this.config.masterVolume * 0.3;
                oscillator.type = 'sawtooth';
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            case 'achievement':
                this.playTone(audioContext, oscillator, gainNode, 0.15, [523, 659, 784, 1046]); // C-E-G-C
                break;
            case 'click':
                oscillator.frequency.value = 1000;
                gainNode.gain.value = this.config.effectsVolume * this.config.masterVolume * 0.2;
                oscillator.type = 'square';
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
        }
    }

    /**
     * Play a sequence of tones
     */
    private playTone(
        context: AudioContext,
        oscillator: OscillatorNode,
        gain: GainNode,
        duration: number,
        frequencies: number[]
    ): void {
        const startTime = context.currentTime;

        frequencies.forEach((freq, i) => {
            const osc = context.createOscillator();
            const g = context.createGain();
            osc.connect(g);
            g.connect(context.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            g.gain.value = this.config.effectsVolume * this.config.masterVolume * 0.5;
            osc.start(startTime + i * duration);
            osc.stop(startTime + (i + 1) * duration);
        });
    }

    /**
     * Plays ambient music track
     */
    playMusic(trackId: AmbientTrack): void {
        // Stop current track first
        this.stopMusic();

        this.currentTrack = trackId;

        if (trackId === 'silence') {
            return;
        }

        const track = this.tracks.find(t => t.id === trackId);
        if (!track?.available) {
            console.warn(`Track ${trackId} is not available yet`);
            return;
        }

        // Load and play the audio file
        try {
            // Import the audio file dynamically
            const audioPath = new URL(`../assets/audio/${trackId}.mp3`, import.meta.url).href;
            this.musicPlayer = new Audio(audioPath);
            this.musicPlayer.loop = true;
            this.musicPlayer.volume = this.config.musicVolume * this.config.masterVolume;
            this.musicPlayer.muted = this.config.muted;
            this.musicPlayer.play().catch(err => console.error('Audio playback failed:', err));
            this.isPlaying = true;
        } catch (error) {
            console.error(`Failed to load track ${trackId}:`, error);
        }
    }

    /**
     * Stops ambient music
     */
    stopMusic(): void {
        if (this.musicPlayer) {
            this.musicPlayer.pause();
            this.musicPlayer = null;
        }
        this.isPlaying = false;
    }

    /**
     * Toggles music playback
     */
    toggleMusic(): void {
        if (this.isPlaying) {
            this.musicPlayer?.pause();
        } else {
            this.musicPlayer?.play();
        }
        this.isPlaying = !this.isPlaying;
    }

    /**
     * Sets master volume (0-1)
     */
    setMasterVolume(volume: number): void {
        this.config.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.musicPlayer) {
            this.musicPlayer.volume = this.config.musicVolume * this.config.masterVolume;
        }
    }

    /**
     * Sets music volume (0-1)
     */
    setMusicVolume(volume: number): void {
        this.config.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicPlayer) {
            this.musicPlayer.volume = this.config.musicVolume * this.config.masterVolume;
        }
    }

    /**
     * Sets effects volume (0-1)
     */
    setEffectsVolume(volume: number): void {
        this.config.effectsVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Toggles mute
     */
    toggleMute(): void {
        this.config.muted = !this.config.muted;
        if (this.musicPlayer) {
            this.musicPlayer.muted = this.config.muted;
        }
    }

    /**
     * Gets current state
     */
    getState() {
        return {
            currentTrack: this.currentTrack,
            isPlaying: this.isPlaying,
            ...this.config,
        };
    }

    /**
     * Gets current track info
     */
    getCurrentTrack(): TrackInfo | undefined {
        return this.tracks.find(t => t.id === this.currentTrack);
    }
}

// Singleton instance
export const audioService = new AudioService();
export default audioService;
