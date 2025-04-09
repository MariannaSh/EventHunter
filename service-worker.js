self.addEventListener('push', function(event) {
   const options = {
     body: event.data.text(),
     icon: '/icon.png',
     data: {
       link: event.data.json().link,
     },
   };
 
   event.waitUntil(
     self.registration.showNotification('Nowe wydarzenie', options)
   );
 });
 
 self.addEventListener('notificationclick', function(event) {
   event.notification.close();
 
   event.waitUntil(
     clients.openWindow(event.notification.data.link)
   );
 });
 