// import Firebase в service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA0G-OKWxw7dJqGT-MMY0rwrN3TZoCrtec",
  authDomain: "eventhunter-749bf.firebaseapp.com",
  projectId: "eventhunter-749bf",
  storageBucket: "eventhunter-749bf.firebasestorage.app",
  messagingSenderId: "1014532896180",
  appId: "1:1014532896180:web:f3efe7b2e6000ece2d2ee1",
  measurementId: "G-9SXKRX92F7"
});

// ✅ FCM w tle (push notification)
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Push w tle:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Dodatkowe eventy PWA
self.addEventListener('install', e => {
  console.log('✅ Service Worker zainstalowany');
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
