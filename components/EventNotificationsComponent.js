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

const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx&startDateTime=1900-01-01T00:00:00Z&size=50&classificationName=music`;

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('Permission status:', permission);  
      if (permission === 'granted') {
        console.log('Zezwolono na powiadomienia');
        subscribeToNotifications();
      } else {
        console.log('Odmówiono zezwolenia na powiadomienia');
      }
    }).catch(err => {
      console.error('Błąd przy żądaniu uprawnień:', err);
    });
  } else {
    console.log('Powiadomienia push nie są wspierane przez ten przeglądarkę');
  }
}

function subscribeToNotifications() {
  messaging.getToken().then((currentToken) => {
    console.log('Current FCM Token:', currentToken);  
    if (currentToken) {
      this.saveTokenToFirestore(currentToken);
    } else {
      console.log('Brak dostępnego tokena');
    }
  }).catch((err) => {
    console.log('Błąd przy pobieraniu tokena. ', err);
  });
}

function saveTokenToFirestore(token) {
  console.log('Saving token to Firestore: ', token);  
  db.collection("userTokens").doc(token).set({
    token: token,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
  .then(() => {
    console.log("Token FCM zapisany w Firestore.");
  })
  .catch(error => {
    console.error("Błąd przy zapisywaniu tokena w Firestore:", error);
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

function handleNewEvents(events) {
  const newEvent = events[0];
  let lastEventTime = null;

  if (newEvent && newEvent.dates.start.dateTime !== lastEventTime) {
    lastEventTime = newEvent.dates.start.dateTime;
    saveEventToFirestore(newEvent);
    sendNotificationsToAllUsers(newEvent);
    triggerVibration();
  }
}

function saveEventToFirestore(eventData) {
  db.collection("notifications").add({
    name: eventData.name,
    description: eventData.description,
    location: eventData._embedded.venues[0].name,
    startDate: eventData.dates.start.dateTime,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  })
  .then(() => {
    console.log("Wydarzenie zapisane w kolekcji 'notifications' w Firestore");
  })
  .catch(error => {
    console.error("Błąd przy zapisywaniu wydarzenia:", error);
  });
}

function getTokensFromFirestore() {
  return db.collection("userTokens").get()
    .then(querySnapshot => {
      const tokens = [];
      querySnapshot.forEach(doc => {
        tokens.push(doc.data().token);
      });
      console.log('Fetched tokens from Firestore:', tokens);  
      return tokens;
    })
    .catch(error => {
      console.error("Błąd przy pobieraniu tokenów z Firestore: ", error);
      return [];
    });
}

function sendNotificationsToAllUsers(eventData) {
  getTokensFromFirestore().then(tokens => {
    tokens.forEach(token => {
      sendWebPushNotification(token, eventData);
    });
  });
}

function sendWebPushNotification(token, eventData) {
  const publicKey = 'BHJrnGGQ65K0R3GKJBe2DUu4s9HC4_9RbGarqwCBQBKcm8eITOL1m9qkkGt3du8BKHLQi_dGIdfQ_0FH19c43NE';
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const eventUrl = eventData._embedded ? eventData._embedded.events[0].url : '';

  const message = {
    notification: {
      title: 'Nie przegap!',
      body: eventData.name,
      icon: eventData.images ? eventData.images[0].url : '/icon.PNG',
    },
    webpush: {
      fcm_options: {
        link: eventUrl,
      },
      applicationServerKey: applicationServerKey,
    },
    to: token,
  };

  fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
  .then(response => response.json())
  .then(data => console.log('Powiadomienie wysłane:', data))
  .catch(error => console.error('Błąd przy wysyłaniu powiadomienia:', error));
}

function triggerVibration() {
  if (navigator.vibrate) {
    navigator.vibrate([500]);
  }
}

requestNotificationPermission();
setInterval(fetchEvents, 60000);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/\_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker zarejestrowany z zakresem:', registration.scope);
    })
    .catch(function(error) {
      console.log('Błąd przy rejestracji Service Worker:', error);
    });
} else {
  console.log('Service Worker nie jest wspierany przez tę przeglądarkę');
}
