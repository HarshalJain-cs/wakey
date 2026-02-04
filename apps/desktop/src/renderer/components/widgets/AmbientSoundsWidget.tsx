// apps/desktop/src/renderer/components/widgets/AmbientSoundsWidget.tsx
// Phase 17: Enhanced UX - Ambient Sounds Widget

import React, { useState, useEffect } from 'react';
import { ambientSoundsService, type AmbientSound, type SoundCategory } from '../../services/ambient-sounds-service';

export const AmbientSoundsWidget: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<SoundCategory | 'presets'>('presets');
    const [activeSounds, setActiveSounds] = useState<string[]>([]);
    const [volumes, setVolumes] = useState<Record<string, number>>({});
    const [masterVolume, setMasterVolume] = useState(0.7);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Sync state with service
        const updateState = () => {
            const active = ambientSoundsService.getActiveSounds();
            setActiveSounds(active.map(s => s.soundId));
            setVolumes(Object.fromEntries(active.map(s => [s.soundId, s.volume])));
            setIsPlaying(ambientSoundsService.isCurrentlyPlaying());
            setMasterVolume(ambientSoundsService.getMasterVolume());
        };

        updateState();
        const interval = setInterval(updateState, 1000);
        return () => clearInterval(interval);
    }, []);

    const categories = ambientSoundsService.getCategories();
    const presets = ambientSoundsService.getPresets();
    const currentSounds = activeCategory === 'presets'
        ? []
        : ambientSoundsService.getSoundsByCategory(activeCategory);

    const handleToggleSound = (soundId: string) => {
        ambientSoundsService.toggleSound(soundId);
        setActiveSounds(ambientSoundsService.getActiveSounds().map(s => s.soundId));
    };

    const handleVolumeChange = (soundId: string, volume: number) => {
        ambientSoundsService.setVolume(soundId, volume);
        setVolumes(prev => ({ ...prev, [soundId]: volume }));
    };

    const handleMasterVolumeChange = (volume: number) => {
        ambientSoundsService.setMasterVolume(volume);
        setMasterVolume(volume);
    };

    const handleLoadPreset = (presetId: string) => {
        ambientSoundsService.loadPreset(presetId);
    };

    const handleStopAll = () => {
        ambientSoundsService.stopAll();
        setActiveSounds([]);
        setIsPlaying(false);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🎧</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Ambient Sounds</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                            {activeSounds.length > 0 ? `${activeSounds.length} sound${activeSounds.length > 1 ? 's' : ''} playing` : 'No sounds playing'}
                        </p>
                    </div>
                </div>
                {activeSounds.length > 0 && (
                    <button
                        onClick={handleStopAll}
                        style={{
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500
                        }}
                    >
                        Stop All
                    </button>
                )}
            </div>

            {/* Master Volume */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px' }}>🔊</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', minWidth: '80px' }}>Master</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                        style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            WebkitAppearance: 'none',
                            background: `linear-gradient(to right, #a78bfa ${masterVolume * 100}%, rgba(255,255,255,0.1) ${masterVolume * 100}%)`,
                            cursor: 'pointer'
                        }}
                    />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', minWidth: '35px', textAlign: 'right' }}>
                        {Math.round(masterVolume * 100)}%
                    </span>
                </div>
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setActiveCategory('presets')}
                    style={{
                        background: activeCategory === 'presets' ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
                        border: activeCategory === 'presets' ? '1px solid rgba(167,139,250,0.4)' : '1px solid transparent',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: activeCategory === 'presets' ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500
                    }}
                >
                    ⭐ Presets
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            background: activeCategory === cat.id ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
                            border: activeCategory === cat.id ? '1px solid rgba(167,139,250,0.4)' : '1px solid transparent',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: activeCategory === cat.id ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500
                        }}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeCategory === 'presets' ? (
                /* Presets Grid */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px'
                }}>
                    {presets.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => handleLoadPreset(preset.id)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '14px',
                                color: 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(167,139,250,0.15)';
                                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                                {preset.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                {preset.sounds.length} sound{preset.sounds.length !== 1 ? 's' : ''}
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                /* Sounds List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentSounds.map(sound => {
                        const isActive = activeSounds.includes(sound.id);
                        const volume = volumes[sound.id] ?? sound.defaultVolume;

                        return (
                            <div
                                key={sound.id}
                                style={{
                                    background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                    border: isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <button
                                    onClick={() => handleToggleSound(sound.id)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {isActive ? '⏸' : '▶'}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '16px' }}>{sound.icon}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{sound.name}</span>
                                    </div>
                                    {isActive && (
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={volume}
                                            onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                                            style={{
                                                width: '100%',
                                                height: '3px',
                                                borderRadius: '2px',
                                                WebkitAppearance: 'none',
                                                background: `linear-gradient(to right, #22c55e ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                                                cursor: 'pointer'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AmbientSoundsWidget;
