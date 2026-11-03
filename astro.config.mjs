import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages sirve los "project sites" en https://<user>.github.io/<repo>/,
// así que las rutas absolutas necesitan el prefijo. Local y preview usan '/'.
// CI lo activa con BASE_PATH=/vacantes-co (ver .github/workflows/deploy.yml).
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  site: 'https://reidert.github.io',
  base,
  compressHTML: true,
  vite: { plugins: [tailwindcss()] },
})
