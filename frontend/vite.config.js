var _a, _b, _c;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    base: (_a = process.env.VITE_BASE) !== null && _a !== void 0 ? _a : '/',
    build: {
        outDir: (_b = process.env.VITE_OUT_DIR) !== null && _b !== void 0 ? _b : 'dist',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@styles': path.resolve(__dirname, './src/styles'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: (_c = process.env.VITE_API_BASE) !== null && _c !== void 0 ? _c : 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
});
