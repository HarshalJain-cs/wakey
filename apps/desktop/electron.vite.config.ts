import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin({ exclude: ['electron'] })],
        build: {
            rollupOptions: {
                output: {
                    format: 'cjs',
                    entryFileNames: '[name].js',
                },
            },
        },
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
