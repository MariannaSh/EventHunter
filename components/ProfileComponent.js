import EventNotificationsComponent from './EventNotificationsComponent.js';

export default {
  components: {
    EventNotificationsComponent
  },
  template: `
    <div class="profile-container">
      <h2 class="profile-heading">TWÓJ PROFIL</h2>

      <div class="avatar-placeholder">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#f3f4f6" stroke="#e11d48" stroke-width="3"/>
          <text x="50" y="58" font-size="32" text-anchor="middle" fill="#e11d48" font-weight="bold" font-family="Arial" dy=".3em">{{ initials }}</text>
        </svg>
      </div>

      <p>Zalogowany jako: {{ userEmail }}</p>
      <p>Data rejestracji: {{ createdAt }}</p>

      <button @click="changePassword" class="login-button outline-button">Zmień hasło</button>
      <button @click="logout" class="login-button">Wyloguj się</button>
      <EventNotificationsComponent />

    </div>`,
  data() {
    return {
      userEmail: '',
      createdAt: '',
        initials: ''
    };
  },
  created() {
    const user = firebase.auth().currentUser;
    if (user) {
      this.userEmail = user.email;
      this.createdAt = new Date(user.metadata.creationTime).toLocaleDateString();
      
      const name = user.email.split('@')[0];
      this.initials = name
        .split(/[.\-_]/)           
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
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
    changePassword() {
      const user = firebase.auth().currentUser;
      if (user && user.email) {
        firebase.auth().sendPasswordResetEmail(user.email)
          .then(() => {
            alert("Wysłano link do zmiany hasła na adres: " + user.email);
          })
          .catch((error) => {
            console.error("Błąd przy zmianie hasła:", error);
            alert("Nie udało się wysłać linku do zmiany hasła.");
          });
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
