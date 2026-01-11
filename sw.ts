
/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Fix: Add __WB_MANIFEST to self declaration to resolve property existence error
declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any[];
};

// تنظيف الذاكرة التخزينية القديمة
cleanupOutdatedCaches();

// التخزين المسبق للملفات الناتجة عن عملية الـ Build
precacheAndRoute(self.__WB_MANIFEST);

// 1. استراتيجية للملفات الثابتة (Static Assets)
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// 2. استراتيجية للصور (Images) - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يوم
      }),
    ],
  })
);

// 3. استراتيجية لطلبات Firebase والبيانات - Network First
registerRoute(
  ({ url }) => url.origin.includes('googleapis.com'),
  new NetworkFirst({
    cacheName: 'firebase-api',
    networkTimeoutSeconds: 5,
  })
);

// تفعيل التحديث الفوري عند طلب السكيب
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
