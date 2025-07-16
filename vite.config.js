// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // This option makes sure the PWA updates automatically
      // when a new version is available, preventing the white screen issue.
      registerType: 'autoUpdate',
      
      // We configure the manifest here instead of in the public folder.
      // This ensures it's part of the build process.
      manifest: {
        name: 'Twenty - Eye Break Reminder',
        short_name: 'Twenty',
        description: 'Follow the 20-20-20 rule to prevent eye strain with customizable reminders.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logowhite.svg', // Assuming logo192.png is in your public folder
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'logowhite.svg', // Assuming logowhite.svg is in your public folder
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'logowhite.svg', // Maskable icon
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});