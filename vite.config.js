import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Build number: git short hash + timestamp
const gitHash = execSync('git rev-parse --short HEAD').toString().trim()
const buildTime = new Date().toISOString().slice(0, 16).replace('T', ' ')

export default defineConfig({
  plugins: [react()],
  base: '/VampireSelectScreen/',
  define: {
    __BUILD_HASH__: JSON.stringify(gitHash),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
})
