import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

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
                    entryFileNames: '[name].cjs',
                },
            },
        },
    },
    renderer: {
        root: resolve(__dirname, 'src/renderer'),
        build: {
            outDir: resolve(__dirname, 'out/renderer'),
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
            },
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/renderer/index.html'),
                },
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        ui: ['lucide-react', 'recharts'],
                        utils: ['zustand', 'date-fns'],
                    },
                },
            },
            sourcemap: false,
            cssMinify: true,
        },
        plugins: [
            react(),
            visualizer({
                filename: 'dist/stats.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
            }),
        ],
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
