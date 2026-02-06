import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';

// Plugin to copy distraction-overlay.html to out/main
const copyDistractionOverlay = () => ({
    name: 'copy-distraction-overlay',
    writeBundle() {
        const mainDir = resolve(__dirname, 'out/main');
        if (!existsSync(mainDir)) {
            mkdirSync(mainDir, { recursive: true });
        }
        const src = resolve(__dirname, 'src/main/distraction-overlay.html');
        const dest = resolve(mainDir, 'distraction-overlay.html');
        if (existsSync(src)) {
            copyFileSync(src, dest);
        }
    }
});

// Plugin to ensure preload output is treated as CommonJS
const ensurePreloadCJS = () => ({
    name: 'ensure-preload-cjs',
    writeBundle() {
        const preloadDir = resolve(__dirname, 'out/preload');
        if (!existsSync(preloadDir)) {
            mkdirSync(preloadDir, { recursive: true });
        }
        writeFileSync(
            resolve(preloadDir, 'package.json'),
            JSON.stringify({ type: 'commonjs' }, null, 2)
        );
    }
});

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin(), copyDistractionOverlay()],
        build: {
            rollupOptions: {
                output: {
                    interop: 'compat',
                },
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin({ exclude: ['electron'] }), ensurePreloadCJS()],
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
                open: false,
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
