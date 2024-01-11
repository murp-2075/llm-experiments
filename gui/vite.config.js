import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
    plugins: [
        /* 
        Uncomment the following line to enable solid-devtools.
        For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
        */
        // devtools(),
        solidPlugin(),
    ],
    server: {
        port: 8080,
        proxy: {
            // Using proxy: 
            // Every request to /api will be forwarded to http://localhost:3000
            '/api': 'http://localhost:3000',
        },
        // open: '/index.html',
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                main: 'app.html',
                // index: 'public/index.html',
                // login: 'public/login.html',
            }
        },
    },
});