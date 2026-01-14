interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
    onDarkModeToggle: () => void;
}
export default function CommandPalette({ isOpen, onClose, darkMode, onDarkModeToggle }: CommandPaletteProps): import("react").JSX.Element | null;
export declare function useCommandPalette(): {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};
export {};
//# sourceMappingURL=CommandPalette.d.ts.map