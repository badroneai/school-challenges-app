
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// تم تعطيل VitePWA لأن بيئة العرض الحالية لا تدعم المديولات الوهمية (Virtual Modules)
export default defineConfig({
  plugins: [
    react()
  ],
});
