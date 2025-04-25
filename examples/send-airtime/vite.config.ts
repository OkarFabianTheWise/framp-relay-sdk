import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/bills': {
        target: 'https://vendor.airbillspay.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bills/, '/bills'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add CORS headers to the proxy request
            proxyReq.setHeader('Origin', 'http://localhost:5173');
            console.log('Sending Request to:', req.url);
          });
        }
      }
    }
  },
  plugins: [react()],
  define: {
    'process.env.ANCHOR_BROWSER': true
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})

