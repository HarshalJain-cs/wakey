// apps/desktop/src/renderer/components/UpdateNotificationBanner.tsx
// Phase 17: Enhanced UX - Update Notification UI

import React, { useState, useEffect } from 'react';

interface UpdateInfo {
    version: string;
    releaseNotes?: string;
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

interface UpdateState {
    status: UpdateStatus;
    info?: UpdateInfo;
    progress?: number;
    error?: string;
}

export const UpdateNotificationBanner: React.FC = () => {
    const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' });
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Listen for update events from main process
        const handleUpdateChecking = () => {
            setUpdateState({ status: 'checking' });
        };

        const handleUpdateAvailable = (_: any, info: UpdateInfo) => {
            setUpdateState({ status: 'available', info });
            setDismissed(false);
        };

        const handleUpdateNotAvailable = () => {
            setUpdateState({ status: 'idle' });
        };

        const handleDownloadProgress = (_: any, data: { percent: number }) => {
            setUpdateState(prev => ({
                ...prev,
                status: 'downloading',
                progress: Math.round(data.percent)
            }));
        };

        const handleUpdateDownloaded = (_: any, info: UpdateInfo) => {
            setUpdateState({ status: 'ready', info });
            setDismissed(false);
        };

        const handleUpdateError = (_: any, error: string) => {
            setUpdateState({ status: 'error', error });
        };

        // Register listeners
        if (typeof window !== 'undefined' && window.electron) {
            window.electron.ipcRenderer.on('update-checking', handleUpdateChecking);
            window.electron.ipcRenderer.on('update-available', handleUpdateAvailable);
            window.electron.ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
            window.electron.ipcRenderer.on('update-download-progress', handleDownloadProgress);
            window.electron.ipcRenderer.on('update-downloaded', handleUpdateDownloaded);
            window.electron.ipcRenderer.on('update-error', handleUpdateError);
        }

        return () => {
            if (typeof window !== 'undefined' && window.electron) {
                window.electron.ipcRenderer.removeAllListeners('update-checking');
                window.electron.ipcRenderer.removeAllListeners('update-available');
                window.electron.ipcRenderer.removeAllListeners('update-not-available');
                window.electron.ipcRenderer.removeAllListeners('update-download-progress');
                window.electron.ipcRenderer.removeAllListeners('update-downloaded');
                window.electron.ipcRenderer.removeAllListeners('update-error');
            }
        };
    }, []);

    const handleDownload = async () => {
        if (window.electron) {
            await window.electron.ipcRenderer.invoke('download-update');
        }
    };

    const handleInstall = async () => {
        if (window.electron) {
            await window.electron.ipcRenderer.invoke('install-update');
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
    };

    // Don't show if dismissed or idle
    if (dismissed || updateState.status === 'idle') {
        return null;
    }

    const getBannerStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        };

        switch (updateState.status) {
            case 'available':
                return { ...baseStyles, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' };
            case 'downloading':
                return { ...baseStyles, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' };
            case 'ready':
                return { ...baseStyles, background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)', color: '#333' };
            case 'error':
                return { ...baseStyles, background: 'linear-gradient(135deg, #EB5757 0%, #F2994A 100%)', color: 'white' };
            default:
                return { ...baseStyles, background: '#f5f5f5', color: '#333' };
        }
    };

    const buttonStyles: React.CSSProperties = {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        transition: 'transform 0.1s, opacity 0.2s',
    };

    const primaryButtonStyles: React.CSSProperties = {
        ...buttonStyles,
        background: updateState.status === 'ready' ? '#333' : 'rgba(255,255,255,0.25)',
        color: updateState.status === 'ready' ? 'white' : 'inherit',
    };

    const dismissButtonStyles: React.CSSProperties = {
        ...buttonStyles,
        background: 'transparent',
        padding: '4px 8px',
        opacity: 0.7,
    };

    return (
        <div style={getBannerStyles()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {updateState.status === 'checking' && (
                    <>
                        <span>🔍</span>
                        <span>Checking for updates...</span>
                    </>
                )}

                {updateState.status === 'available' && (
                    <>
                        <span>🎉</span>
                        <span>
                            <strong>Update available!</strong> Version {updateState.info?.version} is ready to download.
                        </span>
                    </>
                )}

                {updateState.status === 'downloading' && (
                    <>
                        <span>⬇️</span>
                        <span>
                            <strong>Downloading update...</strong> {updateState.progress}%
                        </span>
                        <div style={{
                            width: '120px',
                            height: '6px',
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${updateState.progress}%`,
                                height: '100%',
                                background: 'white',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    </>
                )}

                {updateState.status === 'ready' && (
                    <>
                        <span>✅</span>
                        <span>
                            <strong>Update ready!</strong> Restart to install version {updateState.info?.version}
                        </span>
                    </>
                )}

                {updateState.status === 'error' && (
                    <>
                        <span>⚠️</span>
                        <span>
                            <strong>Update failed:</strong> {updateState.error}
                        </span>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {updateState.status === 'available' && (
                    <button style={primaryButtonStyles} onClick={handleDownload}>
                        Download Now
                    </button>
                )}

                {updateState.status === 'ready' && (
                    <button style={primaryButtonStyles} onClick={handleInstall}>
                        🔄 Restart Now
                    </button>
                )}

                {updateState.status !== 'downloading' && (
                    <button style={dismissButtonStyles} onClick={handleDismiss}>
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default UpdateNotificationBanner;
