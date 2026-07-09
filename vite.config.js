import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/gachapon-simulator/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
