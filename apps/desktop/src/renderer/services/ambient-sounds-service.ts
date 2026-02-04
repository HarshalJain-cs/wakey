// apps/desktop/src/renderer/services/ambient-sounds-service.ts
// Phase 17: Enhanced UX - Ambient Sounds for Focus Sessions

/**
 * Ambient Sounds Service
 * 
 * Provides background soundscapes for focus sessions:
 * - Multiple sound categories (nature, urban, music)
 * - Volume mixing for layered sounds
 * - Timer integration for auto-play/stop
 * - Favorites and presets
 */

export interface AmbientSound {
    id: string;
    name: string;
    category: SoundCategory;
    icon: string;
    audioUrl: string;
    defaultVolume: number;
}

export type SoundCategory = 'nature' | 'urban' | 'white-noise' | 'music' | 'atmospheric';

interface ActiveSound {
    sound: AmbientSound;
    audio: HTMLAudioElement;
    volume: number;
}

interface SoundPreset {
    id: string;
    name: string;
    sounds: { soundId: string; volume: number }[];
}

class AmbientSoundsService {
    private activeSounds: Map<string, ActiveSound> = new Map();
    private presets: SoundPreset[] = [];
    private masterVolume = 0.7;
    private isPlaying = false;

    // Built-in sound library using royalty-free sources
    private readonly SOUND_LIBRARY: AmbientSound[] = [
        // Nature
        { id: 'rain', name: 'Rain', category: 'nature', icon: '🌧️', audioUrl: '/sounds/ambient/rain.mp3', defaultVolume: 0.5 },
        { id: 'thunder', name: 'Thunderstorm', category: 'nature', icon: '⛈️', audioUrl: '/sounds/ambient/thunder.mp3', defaultVolume: 0.4 },
        { id: 'forest', name: 'Forest', category: 'nature', icon: '🌲', audioUrl: '/sounds/ambient/forest.mp3', defaultVolume: 0.5 },
        { id: 'ocean', name: 'Ocean Waves', category: 'nature', icon: '🌊', audioUrl: '/sounds/ambient/ocean.mp3', defaultVolume: 0.5 },
        { id: 'birds', name: 'Birds', category: 'nature', icon: '🐦', audioUrl: '/sounds/ambient/birds.mp3', defaultVolume: 0.4 },
        { id: 'river', name: 'River', category: 'nature', icon: '💧', audioUrl: '/sounds/ambient/river.mp3', defaultVolume: 0.5 },
        { id: 'wind', name: 'Wind', category: 'nature', icon: '💨', audioUrl: '/sounds/ambient/wind.mp3', defaultVolume: 0.3 },

        // Urban
        { id: 'cafe', name: 'Coffee Shop', category: 'urban', icon: '☕', audioUrl: '/sounds/ambient/cafe.mp3', defaultVolume: 0.4 },
        { id: 'city', name: 'City Traffic', category: 'urban', icon: '🏙️', audioUrl: '/sounds/ambient/city.mp3', defaultVolume: 0.3 },
        { id: 'library', name: 'Library', category: 'urban', icon: '📚', audioUrl: '/sounds/ambient/library.mp3', defaultVolume: 0.3 },
        { id: 'office', name: 'Office', category: 'urban', icon: '🏢', audioUrl: '/sounds/ambient/office.mp3', defaultVolume: 0.3 },

        // White Noise
        { id: 'white-noise', name: 'White Noise', category: 'white-noise', icon: '📻', audioUrl: '/sounds/ambient/white-noise.mp3', defaultVolume: 0.4 },
        { id: 'pink-noise', name: 'Pink Noise', category: 'white-noise', icon: '🎵', audioUrl: '/sounds/ambient/pink-noise.mp3', defaultVolume: 0.4 },
        { id: 'brown-noise', name: 'Brown Noise', category: 'white-noise', icon: '🎶', audioUrl: '/sounds/ambient/brown-noise.mp3', defaultVolume: 0.4 },

        // Atmospheric
        { id: 'fireplace', name: 'Fireplace', category: 'atmospheric', icon: '🔥', audioUrl: '/sounds/ambient/fireplace.mp3', defaultVolume: 0.5 },
        { id: 'night', name: 'Night Ambiance', category: 'atmospheric', icon: '🌙', audioUrl: '/sounds/ambient/night.mp3', defaultVolume: 0.4 },
        { id: 'train', name: 'Train Journey', category: 'atmospheric', icon: '🚂', audioUrl: '/sounds/ambient/train.mp3', defaultVolume: 0.4 },
        { id: 'space', name: 'Space Station', category: 'atmospheric', icon: '🛸', audioUrl: '/sounds/ambient/space.mp3', defaultVolume: 0.35 },
    ];

    private readonly DEFAULT_PRESETS: SoundPreset[] = [
        { id: 'focus', name: '🎯 Deep Focus', sounds: [{ soundId: 'rain', volume: 0.4 }, { soundId: 'brown-noise', volume: 0.2 }] },
        { id: 'nature', name: '🌿 Nature Escape', sounds: [{ soundId: 'forest', volume: 0.5 }, { soundId: 'birds', volume: 0.3 }, { soundId: 'river', volume: 0.3 }] },
        { id: 'cozy', name: '🔥 Cozy Cabin', sounds: [{ soundId: 'fireplace', volume: 0.5 }, { soundId: 'rain', volume: 0.3 }] },
        { id: 'cafe', name: '☕ Café Mode', sounds: [{ soundId: 'cafe', volume: 0.5 }, { soundId: 'rain', volume: 0.2 }] },
        { id: 'storm', name: '⛈️ Stormy Night', sounds: [{ soundId: 'thunder', volume: 0.5 }, { soundId: 'rain', volume: 0.6 }, { soundId: 'wind', volume: 0.3 }] },
        { id: 'ocean', name: '🏖️ Beach Day', sounds: [{ soundId: 'ocean', volume: 0.6 }, { soundId: 'wind', volume: 0.2 }] },
    ];

    constructor() {
        this.loadPresets();
    }

    // ============================================
    // Sound Control
    // ============================================

    getSoundLibrary(): AmbientSound[] {
        return [...this.SOUND_LIBRARY];
    }

    getSoundsByCategory(category: SoundCategory): AmbientSound[] {
        return this.SOUND_LIBRARY.filter(s => s.category === category);
    }

    getCategories(): { id: SoundCategory; name: string; icon: string }[] {
        return [
            { id: 'nature', name: 'Nature', icon: '🌲' },
            { id: 'urban', name: 'Urban', icon: '🏙️' },
            { id: 'white-noise', name: 'White Noise', icon: '📻' },
            { id: 'atmospheric', name: 'Atmospheric', icon: '✨' },
        ];
    }

    async playSound(soundId: string, volume?: number): Promise<void> {
        const sound = this.SOUND_LIBRARY.find(s => s.id === soundId);
        if (!sound) return;

        if (this.activeSounds.has(soundId)) {
            // Already playing, just update volume
            this.setVolume(soundId, volume ?? sound.defaultVolume);
            return;
        }

        const audio = new Audio(sound.audioUrl);
        audio.loop = true;
        audio.volume = (volume ?? sound.defaultVolume) * this.masterVolume;

        this.activeSounds.set(soundId, {
            sound,
            audio,
            volume: volume ?? sound.defaultVolume
        });

        try {
            await audio.play();
            this.isPlaying = true;
        } catch (error) {
            console.error('Failed to play sound:', error);
            this.activeSounds.delete(soundId);
        }
    }

    stopSound(soundId: string): void {
        const activeSound = this.activeSounds.get(soundId);
        if (activeSound) {
            activeSound.audio.pause();
            activeSound.audio.currentTime = 0;
            this.activeSounds.delete(soundId);
        }

        if (this.activeSounds.size === 0) {
            this.isPlaying = false;
        }
    }

    toggleSound(soundId: string): void {
        if (this.activeSounds.has(soundId)) {
            this.stopSound(soundId);
        } else {
            this.playSound(soundId);
        }
    }

    setVolume(soundId: string, volume: number): void {
        const activeSound = this.activeSounds.get(soundId);
        if (activeSound) {
            activeSound.volume = Math.max(0, Math.min(1, volume));
            activeSound.audio.volume = activeSound.volume * this.masterVolume;
        }
    }

    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        // Update all active sounds
        this.activeSounds.forEach(({ audio, volume: soundVolume }) => {
            audio.volume = soundVolume * this.masterVolume;
        });
    }

    getMasterVolume(): number {
        return this.masterVolume;
    }

    stopAll(): void {
        this.activeSounds.forEach((_, soundId) => this.stopSound(soundId));
        this.isPlaying = false;
    }

    pauseAll(): void {
        this.activeSounds.forEach(({ audio }) => audio.pause());
        this.isPlaying = false;
    }

    resumeAll(): void {
        this.activeSounds.forEach(({ audio }) => audio.play());
        this.isPlaying = true;
    }

    // ============================================
    // Presets
    // ============================================

    getPresets(): SoundPreset[] {
        return [...this.DEFAULT_PRESETS, ...this.presets];
    }

    async loadPreset(presetId: string): Promise<void> {
        const preset = this.getPresets().find(p => p.id === presetId);
        if (!preset) return;

        this.stopAll();

        for (const { soundId, volume } of preset.sounds) {
            await this.playSound(soundId, volume);
        }
    }

    savePreset(name: string): SoundPreset {
        const sounds = Array.from(this.activeSounds.entries()).map(([soundId, { volume }]) => ({
            soundId,
            volume
        }));

        const preset: SoundPreset = {
            id: `custom-${Date.now()}`,
            name,
            sounds
        };

        this.presets.push(preset);
        this.savePresets();

        return preset;
    }

    deletePreset(presetId: string): void {
        this.presets = this.presets.filter(p => p.id !== presetId);
        this.savePresets();
    }

    private loadPresets(): void {
        try {
            const saved = localStorage.getItem('wakey-ambient-presets');
            if (saved) {
                this.presets = JSON.parse(saved);
            }
        } catch {
            this.presets = [];
        }
    }

    private savePresets(): void {
        localStorage.setItem('wakey-ambient-presets', JSON.stringify(this.presets));
    }

    // ============================================
    // State
    // ============================================

    getActiveSounds(): { soundId: string; name: string; volume: number; icon: string }[] {
        return Array.from(this.activeSounds.entries()).map(([soundId, { sound, volume }]) => ({
            soundId,
            name: sound.name,
            volume,
            icon: sound.icon
        }));
    }

    isCurrentlyPlaying(): boolean {
        return this.isPlaying;
    }

    isSoundActive(soundId: string): boolean {
        return this.activeSounds.has(soundId);
    }
}

export const ambientSoundsService = new AmbientSoundsService();
