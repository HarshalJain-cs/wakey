/**
 * Electron module shim for proper CJS/ESM interop
 * This fixes the esbuild bundling issue where electron namespace import
 * doesn't properly expose named exports
 */

// Use eval to prevent bundler from intercepting the require
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-eval
const electron = eval(`require`)('electron');

export const app = electron.app;
export const BrowserWindow = electron.BrowserWindow;
export const ipcMain = electron.ipcMain;
export const Tray = electron.Tray;
export const Menu = electron.Menu;
export const nativeImage = electron.nativeImage;
export const globalShortcut = electron.globalShortcut;
export const shell = electron.shell;
export const dialog = electron.dialog;
export const nativeTheme = electron.nativeTheme;
export const session = electron.session;
export const net = electron.net;
export const clipboard = electron.clipboard;
export const powerMonitor = electron.powerMonitor;
export const safeStorage = electron.safeStorage;

export default electron;
