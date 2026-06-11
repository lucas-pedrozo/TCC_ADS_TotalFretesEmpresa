import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const LOCAL_DEV_DOMAIN = 'totalfretes.com'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const useHttps = mode === 'https'
  const devHost = env.VITE_DEV_HOST || LOCAL_DEV_DOMAIN
  const devHttpsPort = Number(env.VITE_DEV_HTTPS_PORT) || 443

  return {
    plugins: [
      ...(useHttps
        ? [
            mkcert({
              hosts: [devHost, `www.${devHost}`, 'localhost', '127.0.0.1'],
            }),
          ]
        : []),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon-180x180.png',
          'pwa-64x64.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'maskable-icon-512x512.png',
        ],
        manifest: {
          name: 'Total Fretes Empresa',
          short_name: 'Total Fretes',
          description: 'Gestão de fretes para empresas',
          lang: 'pt-BR',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#086E46',
          background_color: '#086E46',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkOnly',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: useHttps ? devHttpsPort : 5173,
      ...(useHttps
        ? {
            host: true,
            strictPort: true,
            https: {},
          }
        : {}),
      proxy: {
        '/api': {
          // Origem do gateway (nginx), sem path — ex.: http://127.0.0.1:80
          target: env.VITE_GATEWAY_URL || 'http://127.0.0.1:80',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})