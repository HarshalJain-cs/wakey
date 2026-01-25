"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";

type SoundName = "click" | "whoosh" | "success" | "toggle" | "hover" | "darkMode";

interface SoundContextType {
    enabled: boolean;
    toggle: () => void;
    play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
    const [enabled, setEnabled] = useState(false); // Disabled by default until sounds exist
    const soundsRef = useRef<Record<SoundName, HTMLAudioElement | null>>({
        click: null,
        whoosh: null,
        success: null,
        toggle: null,
        hover: null,
        darkMode: null,
    });
    const soundsLoadedRef = useRef(false);

    useEffect(() => {
        // Load saved preference
        const saved = localStorage.getItem("wakey-sound-enabled");
        if (saved !== null) {
            setEnabled(saved === "true");
        }

        // Only attempt to load sounds if enabled
        // This prevents 404 errors when sounds don't exist
        const loadSounds = async () => {
            if (soundsLoadedRef.current) return;

            const soundFiles: Record<SoundName, string> = {
                click: "/sounds/click.mp3",
                whoosh: "/sounds/whoosh.mp3",
                success: "/sounds/success.mp3",
                toggle: "/sounds/toggle.mp3",
                hover: "/sounds/hover.mp3",
                darkMode: "/sounds/dark-mode.mp3",
            };

            // Check if sounds exist before loading
            for (const [name, path] of Object.entries(soundFiles)) {
                try {
                    const response = await fetch(path, { method: "HEAD" });
                    if (response.ok) {
                        soundsRef.current[name as SoundName] = new Audio(path);
                    }
                } catch {
                    // Sound file doesn't exist, skip it
                }
            }

            soundsLoadedRef.current = true;
        };

        // Delay sound loading to not block initial render
        const timer = setTimeout(loadSounds, 1000);
        return () => clearTimeout(timer);
    }, []);

    const toggle = useCallback(() => {
        setEnabled((prev) => {
            const next = !prev;
            localStorage.setItem("wakey-sound-enabled", String(next));
            return next;
        });
    }, []);

    const play = useCallback(
        (name: SoundName) => {
            const sound = soundsRef.current[name];
            if (enabled && sound) {
                sound.currentTime = 0;
                sound.volume = 0.3;
                sound.play().catch(() => {
                    // Autoplay may be blocked
                });
            }
        },
        [enabled]
    );

    return (
        <SoundContext.Provider value={{ enabled, toggle, play }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (!context) {
        // Return no-op functions when used outside provider (SSR)
        return {
            enabled: false,
            toggle: () => { },
            play: () => { },
        };
    }
    return context;
}
