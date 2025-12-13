import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SpendWise',
        short_name: 'SpendWise',
        description: 'Track your expenses and split bills easily',
        theme_color: '#10b981',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/5501/5501375.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/5501/5501375.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});