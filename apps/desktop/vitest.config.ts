import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', 'out'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/renderer/**/*.{ts,tsx}'],
            exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}'],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src/renderer'),
            '@components': resolve(__dirname, 'src/renderer/components'),
            '@pages': resolve(__dirname, 'src/renderer/pages'),
            '@services': resolve(__dirname, 'src/renderer/services'),
        },
    },
});
