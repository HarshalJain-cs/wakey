"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with canvas
const CosmicBackground = dynamic(() => import("./CosmicBackground"), {
    ssr: false,
    loading: () => null,
});

export default function CosmicBackgroundWrapper() {
    return <CosmicBackground />;
}
