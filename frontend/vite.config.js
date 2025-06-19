import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Rediriger les requêtes API vers le backend
      '/api': {
        //target: 'http://localhost:5000', // Remplace avec l'URL réelle de ton backend
        target: 'https://acad-plateforme.yes.bj', // Remplace avec l'URL réelle de ton backend
        changeOrigin: true,
      },
    },
  }
})
