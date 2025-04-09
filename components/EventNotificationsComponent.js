const firebaseConfig = {
   apiKey: "AIzaSyANzQR8EBrd-zCfri912AnvX-xakcZR5jQ",
   authDomain: "eventhunternotifications.firebaseapp.com",
   projectId: "eventhunternotifications",
   storageBucket: "eventhunternotifications.firebasestorage.app",
   messagingSenderId: "717761660508",
   appId: "1:717761660508:web:be1ac7d4694b1d73ad4899",
   measurementId: "G-XLP5BVW1MZ"
 };
 

 firebase.initializeApp(firebaseConfig);
 const db = firebase.firestore();
 const messaging = firebase.messaging();
 
 const apiKey = 'lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx';

 let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&startDateTime=1900-01-01T00:00:00Z&size=50&classificationName=music`;
 
 function requestNotificationPermission() {
   Notification.requestPermission().then(permission => {
     if (permission === 'granted') {
       messaging.getToken().then(token => {
         console.log('FCM Token:', token);
       });
     }
   });
 }
 

 function fetchEvents() {
   fetch(url)
     .then(response => response.json())
     .then(data => {
       if (data._embedded && data._embedded.events) {
         const events = data._embedded.events;
         handleNewEvents(events);
       }
     })
     .catch(error => console.error('Błąd przy pobieraniu wydarzeń:', error));
 }
 
 let lastEventTime = null; 
 
 function handleNewEvents(events) {
   const newEvent = events[0]; 
 
   if (newEvent && newEvent.dates.start.dateTime !== lastEventTime) {
     lastEventTime = newEvent.dates.start.dateTime;
     saveEventToFirestore(newEvent);  
     sendNotification(newEvent);      
     triggerVibration();            
   }
 }
 

 function saveEventToFirestore(eventData) {
   db.collection("events").add({
     name: eventData.name,
     description: eventData.description,
     startDate: eventData.dates.start.dateTime,
     location: eventData._embedded.venues[0].name,
     createdAt: firebase.firestore.FieldValue.serverTimestamp(),
   })
   .then(() => {
     console.log("Wydarzenie zapisane w Firestore");
   })
   .catch(error => {
     console.error("Błąd przy zapisywaniu wydarzenia:", error);
   });
 }
 

 function sendNotification(eventData) {
   if (Notification.permission === 'granted') {
     new Notification('Nowe wydarzenie', {
       body: eventData.name,
       icon: eventData.images ? eventData.images[0].url : '/icon.PNG',
     });
   }
 }
 

 function triggerVibration() {
   if (navigator.vibrate) {
     navigator.vibrate([500]);  
   }
 }
 

 requestNotificationPermission();
 
 setInterval(fetchEvents, 60000);
 