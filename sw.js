self.addEventListener('install', e => {
    console.log('✅ Service Worker zainstalowany');
  });
  
self.addEventListener('fetch', e => {
    e.respondWith(fetch(e.request));
  });
  