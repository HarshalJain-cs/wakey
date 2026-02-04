import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface SoundContextType {
  isEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playHover: () => void;
  playSuccess: () => void;
  playToggle: () => void;
  playWhoosh: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

// Web Audio API based sound generation
const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = createAudioContext();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.1,
    attack: number = 0.01,
    decay: number = 0.1
  ) => {
    if (!isEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + attack + decay);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [isEnabled]);

  const playClick = useCallback(() => {
    // Short, crisp click
    playTone(800, 0.08, 'sine', 0.08, 0.005, 0.02);
    setTimeout(() => playTone(600, 0.05, 'sine', 0.04, 0.005, 0.01), 20);
  }, [playTone]);

  const playHover = useCallback(() => {
    // Subtle hover sound
    playTone(1200, 0.05, 'sine', 0.03, 0.01, 0.02);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    // Pleasant success chime (ascending notes)
    playTone(523.25, 0.15, 'sine', 0.08, 0.01, 0.05); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.08, 0.01, 0.05), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.1, 0.01, 0.1), 200); // G5
  }, [playTone]);

  const playToggle = useCallback(() => {
    // Toggle switch sound
    playTone(600, 0.08, 'sine', 0.06, 0.01, 0.03);
    setTimeout(() => playTone(900, 0.06, 'sine', 0.04, 0.01, 0.02), 50);
  }, [playTone]);

  const playWhoosh = useCallback(() => {
    if (!isEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    // Create white noise for whoosh effect
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for whoosh effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);
    filter.Q.value = 2;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
  }, [isEnabled]);

  const toggleSound = useCallback(() => {
    setIsEnabled(prev => !prev);
    // Initialize audio context if enabling
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
  }, []);

  return (
    <SoundContext.Provider value={{
      isEnabled,
      toggleSound,
      playClick,
      playHover,
      playSuccess,
      playToggle,
      playWhoosh,
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

// Sound toggle button component
export const SoundToggle = () => {
  const { isEnabled, toggleSound, playToggle } = useSound();

  const handleToggle = () => {
    toggleSound();
    if (!isEnabled) {
      // Will play after enabling
      setTimeout(playToggle, 50);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-muted transition-colors"
      data-cursor-hover
      aria-label={isEnabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {isEnabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </button>
  );
};
