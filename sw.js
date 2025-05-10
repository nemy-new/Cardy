// sw.js
const CACHE_NAME = 'card-app-cache-v1.1'; // キャッシュ名を変更して更新を促す
const urlsToCache = [
  './', // ルートパス (index.htmlを指すことが多い)
  './index.html', // HTMLファイル名を明示的に指定
  // 必要に応じて他の静的アセット(ローカルCSS, JSファイルなど)もここに追加
  // CDN経由のTailwindやGoogle Fontsはブラウザキャッシュに任せるのが一般的
];

self.addEventListener('install', event => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetch event for', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: Found in cache', event.request.url);
          return response; // キャッシュにあればそれを返す
        }
        console.log('Service Worker: Not found in cache, fetching from network', event.request.url);
        return fetch(event.request); // なければネットワークから取得
      })
      .catch(error => {
        console.error('Service Worker: Fetch error:', error);
        // オフライン時のフォールバックページなどをここで返すことも可能
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activate event');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 新しいService Workerがすぐにページを制御できるようにする
  return self.clients.claim();
});
