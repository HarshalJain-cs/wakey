import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        root: resolve(__dirname, 'src/renderer'),
        build: {
            outDir: resolve(__dirname, 'out/renderer'),
            rollupOptions: {
                input: resolve(__dirname, 'src/renderer/index.html'),
            },
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src/renderer'),
                '@components': resolve(__dirname, 'src/renderer/components'),
                '@hooks': resolve(__dirname, 'src/renderer/hooks'),
                '@pages': resolve(__dirname, 'src/renderer/pages'),
                '@styles': resolve(__dirname, 'src/renderer/styles'),
            },
        },
    },
});
//# sourceMappingURL=electron.vite.config.js.map