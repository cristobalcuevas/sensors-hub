// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Dejamos solo React por ahora.
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});