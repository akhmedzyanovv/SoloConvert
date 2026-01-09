import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { qrcode } from 'vite-plugin-qrcode';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    const https =
        env.VITE_SSL_KEY_PATH && env.VITE_SSL_CERT_PATH
            ? {
                  key: fs.readFileSync(
                      path.resolve(__dirname, env.VITE_SSL_KEY_PATH)
                  ),
                  cert: fs.readFileSync(
                      path.resolve(__dirname, env.VITE_SSL_CERT_PATH)
                  )
              }
            : undefined;

    return {
        base: env.VITE_BASE_URL,
        plugins: [
            react(),
            tailwindcss(),
            qrcode(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
                manifest: {
                    name: 'SoloConvert',
                    short_name: 'SoloConvert',
                    description:
                        'Privacy-first video to GIF converter. Simple, fast, and runs entirely in your browser.',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    display: 'standalone',
                    icons: [
                        {
                            src: `${env.VITE_BASE_URL}pwa-192x192.png`,
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any'
                        },
                        {
                            src: `${env.VITE_BASE_URL}pwa-512x512.png`,
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any'
                        },
                        {
                            src: `${env.VITE_BASE_URL}pwa-maskable-192x192.png`,
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'maskable'
                        },
                        {
                            src: `${env.VITE_BASE_URL}pwa-maskable-512x512.png`,
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable'
                        }
                    ]
                },
                workbox: {
                    runtimeCaching: [
                        {
                            urlPattern: ({ url }) =>
                                url.pathname.includes('ffmpeg-core'),
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'ffmpeg-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        }
                    ]
                }
            })
        ],
        optimizeDeps: {
            exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        server: {
            headers: {
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Cross-Origin-Opener-Policy': 'same-origin'
            },
            https
        }
    };
});
