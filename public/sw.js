const CACHE_NAME = 'quran-review-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  './data/quran.json',       // إن وجد
  'https://fonts.googleapis.com/css2?family=Arial' // أو أي شيء تستخدمه
];

// تثبيت الكاش أول مرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// عند الطلب، استخدم الكاش أو جلب جديد
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
