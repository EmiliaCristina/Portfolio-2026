import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serve i "project sites" da
  // https://<user>.github.io/<repo-name>/ e non dalla radice del dominio:
  // senza questo, Vite genera path tipo /assets/xxx.js che sul dominio
  // github.io risultano 404 -> pagina bianca. Cambia "DEC-Portfolio" con
  // il nome esatto del tuo repository.
  base: '/DEC-Portfolio/',
});

