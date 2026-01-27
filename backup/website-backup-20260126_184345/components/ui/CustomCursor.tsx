"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        const handleMouseLeave = () => setIsVisible(false);

        const handleElementHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isHoverTarget = target.closest("a, button, [data-cursor-hover], input, textarea");
            setIsHovering(!!isHoverTarget);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousemove", handleElementHover);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousemove", handleElementHover);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    if (!isVisible || isMobile) return null;

    return (
        <>
            {/* Dot */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{ backgroundColor: "#14b8a6" }}
                animate={{
                    x: position.x - 4,
                    y: position.y - 4,
                    scale: isClicking ? 0.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
            />

            {/* Ring */}
            <motion.div
                className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
                style={{
                    border: "1px solid #2dd4bf",
                }}
                animate={{
                    x: position.x - (isHovering ? 24 : 16),
                    y: position.y - (isHovering ? 24 : 16),
                    width: isHovering ? 48 : 32,
                    height: isHovering ? 48 : 32,
                    opacity: isHovering ? 0.8 : 0.5,
                    backgroundColor: isHovering ? "rgba(20, 184, 166, 0.1)" : "transparent",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
        </>
    );
}
