import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // Use relative paths for assets
    server: {
        host: true, // Listen on all network IP addresses
        port: 5173,
        cors: true,
        open: false // Desativado open para evitar abrir abas extras no startup invisível
    }
});
