import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  },
  build: {
    outDir: 'dist',
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 300, // Reduzido para alertar bundles grandes
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          // Framer Motion
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          // Charts - Recharts
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          // Charts - ApexCharts
          if (id.includes('apexcharts')) {
            return 'vendor-apex';
          }
          // Forms
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'vendor-forms';
          }
          // Date utilities
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'vendor-date';
          }
          // PDF/Export
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-export';
          }
          // Icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        compact: true
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
      manifest: {
        name: 'MaxNutrition',
        short_name: 'MaxNutrition',
        description: 'Nutrição inteligente e personalizada para sua saúde',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['health', 'fitness', 'lifestyle'],
        lang: 'pt-BR',
        prefer_related_applications: false,
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x736',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard MaxNutrition'
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '576x1024',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Dashboard Mobile'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/(?!api|auth|rest|storage|functions).*/],
        skipWaiting: false,
        clientsClaim: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['@lovable/tagger'],
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  }
}));
