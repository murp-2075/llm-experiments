import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
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
    base: '/messaging',
    server: {
        port: 8080,
        proxy: {
            // Using proxy: 
            // Every request to /api will be forwarded to http://localhost:3000
            '/api': 'http://localhost:3000',
        },
    },
    build: {
        target: 'esnext',
    },
});