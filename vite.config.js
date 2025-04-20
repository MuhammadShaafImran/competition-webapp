import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define environment variables to be made available in the client
  define: {
    // Stringify the values to ensure they work properly in the client
    'process.env': {}
  }
})
