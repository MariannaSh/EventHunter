export default {
  template: `
    <div>
      <h2>Twój profil</h2>
      <p>Tutaj będą zapisane dane użytkownika.</p>
      <p>Zalogowany jako: {{ userEmail }}</p>
      <button @click="logout">Wyloguj się</button>
      <button @click="requestNotificationsPermission">Powiadomienia</button>
    </div>`,
  data() {
    return {
      userEmail: ''
    };
  },
  created() {
    const user = firebase.auth().currentUser;
    if (user) {
      this.userEmail = user.email;
    }
  },
  methods: {
    logout() {
      firebase.auth().signOut().then(() => {
        alert("Wylogowano!");
        location.hash = '/';
      });
    },

    requestNotificationsPermission() {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Zezwolono na powiadomienia');
            this.subscribeToNotifications();
          } else {
            console.log('Odmówiono zezwolenia na powiadomienia');
          }
        }).catch(err => {
          console.error('Błąd przy żądaniu uprawnień:', err);
        });
      } else {
        console.log('Powiadomienia push nie są wspierane przez ten przeglądarkę');
      }
    },

    subscribeToNotifications() {
      const messaging = firebase.messaging();
      messaging.getToken().then((currentToken) => {
        if (currentToken) {
          console.log('Token FCM:', currentToken);
          this.saveTokenToFirestore(currentToken);
        } else {
          console.log('Brak dostępnego tokena');
        }
      }).catch((err) => {
        console.log('Błąd przy pobieraniu tokena. ', err);
      });
    },

    saveTokenToFirestore(token) {
      const db = firebase.firestore();
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
  },

  mounted() {
  }
};
