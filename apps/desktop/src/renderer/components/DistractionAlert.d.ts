interface DistractionAlertProps {
    app: string;
    title: string;
    onDismiss: () => void;
    onBlock: () => void;
}
export default function DistractionAlert({ app, title, onDismiss, onBlock }: DistractionAlertProps): import("react").JSX.Element | null;
export declare function useDistractionAlert(): {
    alert: {
        app: string;
        title: string;
    } | null;
    dismiss: () => void;
    block: () => void;
};
export {};
//# sourceMappingURL=DistractionAlert.d.ts.map